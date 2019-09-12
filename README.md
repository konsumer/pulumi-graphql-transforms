# pulumi-graphql-transforms

Use amplify transforms in pulumi to create AWS resources.

I really like the [appsync/amplify transforms](https://aws-amplify.github.io/docs/cli-toolchain/graphql) for GraphQL. With a few schema-directives you can get a full API with auth, roles, dynamo, lambdas, etc.  This will allow you to make CRUD endpoints really fast.

I wanted to be able to modify the generated code before committing it to infrastructure if needed, so I made this in 2 parts.

## usage

Add it to your project:

```bash
npm i -D pulumi-graphql-transforms
```

use it in your pulumi script:

```js
import { appsync } from '@pulumi/aws'
import { transform, commit } from 'pulumi-graphql-transforms'

// you can also use fs.readFileSync(FILE).toString() or merge-graphql-schemas
const typeDefs = `
type Blog @model @auth(rules: [{allow: owner }]) {
  id: ID!
  name: String!
  posts: [Post] @connection(name: "BlogPosts")
}
type Post @model @auth(rules: [{allow: owner }]) {
  id: ID!
  title: String!
  blog: Blog @connection(name: "BlogPosts")
  comments: [Comment] @connection(name: "PostComments")
}
type Comment @model @auth(rules: [{allow: owner }]) {
  id: ID!
  content: String
  post: Post @connection(name: "PostComments")
}
`

// create a big object with all the info
// `schema` is the full graphql schema, after being transformed
// `resources` is an object that is shaped like pulumi parameters for various resource-contructors
const { schema, resources } = transform(typeDefs)

// feel free to modify anything before you commit

// make an appsync api
const api = new appsync.GraphQLApi(`${getProject()}_graphql_${getStack()}`, { schema })

// commit the structure to infrastructure
commit(api, resources)

// feel free to add more resources or whatever here
```

This will create a bunch of authenticated, linked, and fancy CRUD fucntions for you.

In your Graphql you can use [all the amplify directives](https://aws-amplify.github.io/docs/cli-toolchain/graphql) and you can also put `${env}` in your schema, or `${project}` and it will be replaced with pulumi's `getStack` and `getProject`. All resources are automatically setup like this: `${project}_name_type_${env}`, but it can be handy for parameters like `@function` which are not automatically prefixed on creation.

For a full example that uses Auth0 OAuth, connected models, and has example Pulumi config see `example/`.