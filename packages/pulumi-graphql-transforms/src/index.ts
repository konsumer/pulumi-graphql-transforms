import { appsync } from '@pulumi/aws'
import GraphQLTransform from 'graphql-transformer-core'
import AppSyncDynamoDBTransformer from 'graphql-dynamodb-transformer'
import AppSyncFunctionTransformer from 'graphql-function-transformer'
import AppSyncElasticsearchTransformer from 'graphql-elasticsearch-transformer'
import AppSyncConnectionTransformer from 'graphql-connection-transformer'
import AppSyncAuthTransformer from 'graphql-auth-transformer'
import { getStack, getProject } from '@pulumi/pulumi'

type TranformOutput = {
  schema: string,
  resources: Resources
}

type Resources = {
  vtl: { [s: string]: string }
}


/**
 * Applies amplify transforms on GraphQL, and returns new schema & info about reources that should be created
 * 
 * @param typeDefs A graphql SDL string of your models & API
 */
export const transform = (typeDefs: string): TranformOutput => {
  const transformer = new GraphQLTransform({
    transformers: [
      new AppSyncDynamoDBTransformer(),
      new AppSyncElasticsearchTransformer(),
      new AppSyncAuthTransformer(),
      new AppSyncConnectionTransformer(),
      new AppSyncFunctionTransformer()
    ]
  })

  const { schema, resolvers, rootStack, stacks, stackMapping } = transformer.transform(typeDefs.replace(/\${env}/g, getStack()).replace(/\${project}/g, getProject()))

  // TODO: implement this
  const resources = {
    vtl: resolvers
  }

  return { schema, resources}
}

/**
 * Apply a bunch of appsync transforms
 * 
 * @param api Your Pulumi AppSync instance
 * @param resources info about reources that should be created (from `transform()`)
 */
export const commit = (api: appsync.GraphQLApi, resources: Resources): object => {
  const created = {}
  return created
}

export default { transform, commit }