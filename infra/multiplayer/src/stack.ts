import { fileURLToPath } from 'node:url'
import { App, CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { CfnStage, WebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'

const app = new App()
const stageName = 'lobby'
const origins = String(app.node.tryGetContext('allowedOrigins') ?? '').split(',').map(value => value.trim()).filter(Boolean)
if (!origins.length || origins.some(value => {
  try { const url = new URL(value); return url.protocol !== 'https:' || url.origin !== value } catch { return true }
})) throw new Error('Pass -c allowedOrigins=https://your-frontend-host with exact HTTPS origins.')

const stack = new Stack(app, 'ShieldQuestLobby', { env: {
  account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
} })
const logs = (id: string) => new LogGroup(stack, id, {
  retention: RetentionDays.TWO_WEEKS, removalPolicy: RemovalPolicy.DESTROY,
})
const table = new Table(stack, 'LobbyTable', {
  partitionKey: { name: 'pk', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST, timeToLiveAttribute: 'ttl',
  encryption: TableEncryption.AWS_MANAGED, removalPolicy: RemovalPolicy.DESTROY,
})

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const makeHandler = (handler: 'connect' | 'disconnect' | 'message') => {
  const logGroup = logs(handler + 'Logs')
  const role = new Role(stack, handler + 'Role', { assumedBy: new ServicePrincipal('lambda.amazonaws.com') })
  logGroup.grantWrite(role)
  return new NodejsFunction(stack, handler, {
    entry: here('./handlers.ts'), handler, runtime: Runtime.NODEJS_22_X,
    projectRoot: here('../../../'), depsLockFilePath: here('../package-lock.json'),
    bundling: { externalModules: [], minify: true, target: 'node22' },
    environment: { ROOM_TABLE: table.tableName, ...(handler === 'connect' && { ALLOWED_ORIGINS: origins.join(',') }) },
    role, logGroup, timeout: Duration.seconds(12), memorySize: 256,
  })
}
const connect = makeHandler('connect')
const disconnect = makeHandler('disconnect')
const message = makeHandler('message')
const policy = (target: NodejsFunction, actions: string[], prefixes: string[]) => target.addToRolePolicy(new PolicyStatement({
  actions: actions.map(action => 'dynamodb:' + action), resources: [table.tableArn],
  conditions: {
    Null: { 'dynamodb:LeadingKeys': 'false' },
    'ForAllValues:StringLike': { 'dynamodb:LeadingKeys': prefixes },
  },
}))
policy(connect, ['UpdateItem'], ['RATE#IP#*'])
policy(message, ['UpdateItem'], ['RATE#MSG#*'])
policy(message, ['GetItem', 'PutItem', 'ConditionCheckItem'], ['C#*', 'R#*', 'S#*'])
policy(disconnect, ['GetItem', 'PutItem', 'ConditionCheckItem'], ['C#*', 'R#*', 'S#*'])
const api = new WebSocketApi(stack, 'LobbyApi', {
  routeSelectionExpression: '$request.body.type',
  connectRouteOptions: { integration: new WebSocketLambdaIntegration('Connect', connect) },
  disconnectRouteOptions: { integration: new WebSocketLambdaIntegration('Disconnect', disconnect) },
  defaultRouteOptions: { integration: new WebSocketLambdaIntegration('Messages', message) },
})
for (const target of [disconnect, message]) {
  target.addToRolePolicy(new PolicyStatement({
    actions: ['execute-api:ManageConnections'],
    resources: [stack.formatArn({ service: 'execute-api', resource: api.apiId, resourceName: `${stageName}/POST/@connections/*` })],
  }))
}
const apiLogs = logs('GatewayLogs')
new CfnStage(stack, 'Stage', {
  apiId: api.apiId, stageName, autoDeploy: true,
  accessLogSettings: {
    destinationArn: apiLogs.logGroupArn,
    format: '{"requestId":"$context.requestId","route":"$context.routeKey","status":"$context.status"}',
  },
  defaultRouteSettings: { throttlingBurstLimit: 60, throttlingRateLimit: 30, dataTraceEnabled: false },
})
new CfnOutput(stack, 'LobbyWebSocketUrl', { value: `${api.apiEndpoint}/${stageName}` })
