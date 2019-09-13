# pulumi-graphql-transforms

Use amplify transforms in pulumi to create AWS resources.

I really like the [appsync/amplify transforms](https://aws-amplify.github.io/docs/cli-toolchain/graphql) for GraphQL. With a few schema-directives you can get a full API with auth, roles, dynamo, lambdas, etc.  This will allow you to make CRUD endpoints really fast.

## usage

Add it to your project:

```bash
npm i -D pulumi-graphql-transforms
```

use it in your pulumi script:

```js
import { transform } from 'pulumi-graphql-transforms'

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
const resources = transform(typeDefs)

// modify `resources` however you like here

```

This will create a bunch of authenticated, linked, and fancy CRUD functions for you.

In your Graphql you can use [all the amplify directives](https://aws-amplify.github.io/docs/cli-toolchain/graphql) and you can also put `${env}` in your schema, or `${project}` and it will be replaced with pulumi's `getStack` and `getProject`. All resources are automatically setup like this: `${project}_name_type_${env}`, but it can be handy for parameters like `@function` which are not automatically prefixed on creation.

For a full example that uses Auth0 OAuth, connected models, and has example Pulumi config see [`example/`](example).