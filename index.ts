// import express from 'express'
import {ApolloServer} from '@apollo/server'
// import {graphqlHTTP} from 'express-graphql'
import {startStandaloneServer} from '@apollo/server/standalone'
// import {makeExecutableSchema} from 'graphql-tools'
import {readFileSync} from 'fs'
import resolvers from './src/resolvers/index.js'
import dateScalar from './src/customScalars/dateScalar.js'
import {Book} from '@prisma/client'

// const app = express()

const typeDefs = readFileSync('./schema/schema.graphql', {encoding: 'utf-8'})

export interface AppContext {
  dataSources: {
    books: Book[]
  }
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
  context: async () => ({
    dataSources: {
      books: []
    }
  }),
  listen: {port},
})

// const host = process.env.host || 'localhost'

// server.listen(port, host, () => {
//   console.debug(`Server is running at http://${host}:${port}`)
// })

console.debug(`🚀  Server is running at: ${url}`)
