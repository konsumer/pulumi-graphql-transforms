import { transform } from './index'

const typeDefs = `
type Blog @model {
  id: ID!
  name: String!
  posts: [Post] @connection(name: "BlogPosts")
}
type Post @model {
  id: ID!
  title: String!
  blog: Blog @connection(name: "BlogPosts")
  comments: [Comment] @connection(name: "PostComments")
}
type Comment @model {
  id: ID!
  content: String
  post: Post @connection(name: "PostComments")
}
`

let resources

describe('pulumi-graphql-transforms', () => {
  it('should be able to create an API', () => {
    resources = transform(typeDefs, { authenticationType: 'API_KEY' })
    expect(resources.api).toBeDefined()
    expect(resources.api.__pulumiType).toEqual('aws:appsync/graphQLApi:GraphQLApi')
    expect(resources.api.__name).toEqual('pulumi-graphql-transforms_api_test')
  })
})
