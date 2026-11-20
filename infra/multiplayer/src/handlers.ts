import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoStore } from './dynamo'
import { LobbyService } from './service'

type GatewayEvent = {
  headers?: Record<string, string | undefined>
  body?: string
  isBase64Encoded?: boolean
  requestContext: {
    connectionId: string
    domainName: string
    stage: string
    identity?: { sourceIp?: string }
  }
}

const store = new DynamoStore(process.env.ROOM_TABLE!)
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean))

function lobby(event: GatewayEvent) {
  const { domainName, stage } = event.requestContext
  const api = new ApiGatewayManagementApiClient({ endpoint: `https://${domainName}/${stage}` })
  return new LobbyService(store, async (connectionId, envelope) => {
    await api.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: Buffer.from(JSON.stringify(envelope)) }))
  })
}

export function gatewayHandlers(serviceFor: (event: GatewayEvent) => LobbyService, origins: ReadonlySet<string>) {
  return {
    async connect(event: GatewayEvent) {
      const origin = Object.entries(event.headers ?? {}).find(([name]) => name.toLowerCase() === 'origin')?.[1]
      const ip = event.requestContext.identity?.sourceIp
      return { statusCode: ip && await serviceFor(event).allowConnect(origin, ip, origins) ? 200 : 403 }
    },
    async disconnect(event: GatewayEvent) {
      await serviceFor(event).disconnect(event.requestContext.connectionId)
      return { statusCode: 200 }
    },
    async message(event: GatewayEvent) {
      const body = event.isBase64Encoded ? '' : event.body ?? ''
      try {
        await serviceFor(event).message(event.requestContext.connectionId, body)
        return { statusCode: 200 }
      } catch (error) {
        if (error instanceof Error && error.name === 'GoneException') return { statusCode: 200 }
        // Avoid logging the event body, room code, display name or resume credential.
        console.error('Lobby request failed', { name: error instanceof Error ? error.name : 'Unknown' })
        return { statusCode: 500 }
      }
    },
  }
}

export const { connect, disconnect, message } = gatewayHandlers(lobby, allowedOrigins)
