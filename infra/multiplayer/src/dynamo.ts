import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { Entity, Mutation, Store } from './model'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
})

export class DynamoStore implements Store {
  constructor(private readonly tableName: string) {}

  async get(pk: string) {
    const response = await client.send(new GetCommand({ TableName: this.tableName, Key: { pk }, ConsistentRead: true }))
    return response.Item as Entity | undefined
  }

  async commit(mutations: Mutation[]) {
    try {
      await client.send(new TransactWriteCommand({
        TransactItems: mutations.map(({ pk, before, after, check }) => {
          const condition = {
            TableName: this.tableName,
            ConditionExpression: before ? '#rev = :rev' : 'attribute_not_exists(pk)',
            ...(before && { ExpressionAttributeNames: { '#rev': 'rev' }, ExpressionAttributeValues: { ':rev': before.rev } }),
          }
          if (check) return { ConditionCheck: { ...condition, Key: { pk } } }
          if (!after) throw new Error('Missing post-transaction record')
          return { Put: { ...condition, Item: after } }
        }),
      }))
      return true
    } catch (error) {
      if (error instanceof Error && (error.name === 'TransactionCanceledException' || error.name === 'TransactionConflictException')) return false
      throw error
    }
  }

  async allow(key: string, now: number, limit: number) {
    const window = Math.floor(now / 60_000)
    try {
      await client.send(new UpdateCommand({
        TableName: this.tableName,
        Key: { pk: `RATE#${key}#${window}` },
        UpdateExpression: 'SET #ttl = :expiry ADD #count :one',
        ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
        ExpressionAttributeNames: { '#count': 'count', '#ttl': 'ttl' },
        ExpressionAttributeValues: { ':one': 1, ':limit': limit, ':expiry': (window + 3) * 60 },
      }))
      return true
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
      throw error
    }
  }
}
