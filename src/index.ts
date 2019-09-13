import { appsync, dynamodb, iam, lambda  } from '@pulumi/aws'
import GraphQLTransform from 'graphql-transformer-core'
import AppSyncDynamoDBTransformer from 'graphql-dynamodb-transformer'
import AppSyncFunctionTransformer from 'graphql-function-transformer'
import AppSyncElasticsearchTransformer from 'graphql-elasticsearch-transformer'
import AppSyncConnectionTransformer from 'graphql-connection-transformer'
import AppSyncAuthTransformer from 'graphql-auth-transformer'
import { getStack, getProject } from '@pulumi/pulumi'
import { GraphQLApiArgs } from '@pulumi/aws/appsync'

type Resources = {[name: string] : dynamodb.Table|iam.Role|iam.Policy|iam.RolePolicyAttachment|appsync.DataSource|appsync.Resolver|lambda.Function}

/**
 * Applies amplify transforms on GraphQL, and returns new schema & the resources that should be created
 * 
 * @param typeDefs A graphql SDL string of your models & API
 */
export const transform = (typeDefs: string, apiSettings: GraphQLApiArgs): Resources => {
  const env = getStack()
  const project = getProject()
  
  const transformer = new GraphQLTransform({
    transformers: [
      new AppSyncDynamoDBTransformer(),
      new AppSyncElasticsearchTransformer(),
      new AppSyncAuthTransformer(),
      new AppSyncConnectionTransformer(),
      new AppSyncFunctionTransformer()
    ]
  })
  const { schema, resolvers, rootStack, stacks, stackMapping } = transformer.transform(typeDefs.replace(/\$\{env\}/g, env).replace(/\$\{project\}/g, project))

  const resources = {}

  // make an appsync api
  resources['api'] = new appsync.GraphQLApi(`${project}_api_${env}`, { schema, ...apiSettings })

  Object.keys(stacks).forEach(modelName => {
    const model = stacks[modelName]
    const resources = model.Resources as object
    Object.keys(resources).forEach(resourceName => {
      const resource = resources[resourceName]
      switch(modelName){
        case 'ConnectionStack':
          // setup connection index
          break
        case 'FunctionDirectiveStack':
          // setup lambda
          break
        default:
          // setup dynamo & datasource
      }
    })
  })

  return resources
}
