// import express from 'express'
import {ApolloServer} from '@apollo/server'
// import {graphqlHTTP} from 'express-graphql'
import {startStandaloneServer} from '@apollo/server/standalone'
// import {makeExecutableSchema} from 'graphql-tools'
import {readFileSync} from 'fs'
import resolvers from './src/resolvers/index.js'
import dateScalar from './src/customScalars/dateScalar.js'
import autorization from './src/services/user/authorization.js'
import decode from './src/utils/token/decode.js'
import encode from './src/utils/token/encode.js'
import verifyUser from './src/services/user/verifyUser.js'
import {User} from '@prisma/client'
import bookService from './src/services/book/bookService.js'
// import {GraphQLError} from 'graphql/error/GraphQLError.js'

// const app = express()

const typeDefs = readFileSync('./schema/schema.graphql', {encoding: 'utf-8'})

const getUser = async (token: string) => {
  const userData = decode(token)
  if (!userData) {
    return null
  }
  const {id, email} = userData

  return await verifyUser(id, email)
}

export interface AppContext {
  user: User;
  isAuthenticated: boolean;
  authAPI: typeof autorization;
  bookAPI: typeof bookService;
  // user: UserInterface;
}

// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers: {
//     Date: dateScalar,
//     ...resolvers
//   }
// })
const allResolvers = {
  Date: dateScalar,
  ...resolvers
}

const server = new ApolloServer<AppContext>({
  typeDefs,
  resolvers: allResolvers,
})

// await server.start()

// app.use('/graphql', graphqlHTTP({
//   schema,
//   graphiql: true,
// }))
const port = Number.parseInt(process.env.port, 10) || 8000

const {url} = await startStandaloneServer(server, {
  context: async ({req}) => {
    const token = req.headers.authorization || ''

    const user = await getUser(token)
    console.log('user', user)
    // optionally block the user
    // we could also check user roles/permissions here
    // if (!user) {
    //   // throwing a `GraphQLError` here allows us to specify an HTTP status code,
    //   // standard `Error`s will have a 500 status code by default
    //   throw new GraphQLError('User is not authenticated', {
    //     extensions: {
    //       code: 'UNAUTHENTICATED',
    //       http: {status: 401},
    //     },
    //   })
    // }
    // add the user to the context
    return {user, isAuthenticated: !!user, authAPI: autorization, bookAPI: bookService}
  },
  listen: {port},
})

// const host = process.env.host || 'localhost'

// server.listen(port, host, () => {
//   console.debug(`Server is running at http://${host}:${port}`)
// })

console.debug(`🚀  Server is running at: ${url}`)

console.debug(encode({id: 1, email: 'aaa@vestberry.com'}))
