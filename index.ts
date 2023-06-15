import {ApolloServer} from '@apollo/server'
import {startStandaloneServer} from '@apollo/server/standalone'
import {readFileSync} from 'fs'
import resolvers from './src/resolvers/index.js'
import dateScalar from './src/customScalars/dateScalar.js'
import autorization from './src/services/user/authorization.js'
import decode from './src/utils/token/decode.js'
import encode from './src/utils/token/encode.js'
import findUser from './src/services/user/findUser.js'
import {User} from '@prisma/client'
import bookService from './src/services/book/bookService.js'

const typeDefs = readFileSync('./schema/schema.graphql', {encoding: 'utf-8'})

const getUser = async (token: string) => {
  const userData = decode(token)
  if (!userData) {
    return null
  }
  const {id, email} = userData

  return await findUser(id, email)
}

export interface AppContext {
  user: User;
  isAuthenticated: boolean;
  authAPI: typeof autorization;
  bookAPI: typeof bookService;
}

const allResolvers = {
  Date: dateScalar,
  ...resolvers
}

const server = new ApolloServer<AppContext>({
  typeDefs,
  resolvers: allResolvers,
})

const port = Number.parseInt(process.env.port, 10) || 8000

const {url} = await startStandaloneServer(server, {
  context: async ({req}) => {
    const token = req.headers.authorization || ''
    const user = await getUser(token)

    // add the user to the context
    return {user, isAuthenticated: !!user, authAPI: autorization, bookAPI: bookService}
  },
  listen: {port},
})

console.debug(`🚀  Server is running at: ${url}`)

console.debug(`
*** Only for testing ***
user: "aaa@vestberry.com"
token:"${encode({id: 1, email: 'aaa@vestberry.com'})}"`)
