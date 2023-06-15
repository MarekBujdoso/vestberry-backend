import {MutationResolvers} from '../gql/resolvers-types'
import {UNAUTHENTICATED_BOOK_RESPONSE} from './resolverConstants.js'
import {createFailureResponseByType, createSuccessResponseByType} from '../utils/resolvers/resolverUtils.js'

// Use the generated `MutationResolvers` type to type check our mutations!
const mutations: MutationResolvers = {
  Mutation: {
    addBook: async (_, {title, author, yearOfPublication, rating, genres}, {user, bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return UNAUTHENTICATED_BOOK_RESPONSE
      }

      const newBook = await bookAPI.addBook({title, author, yearOfPublication, rating, genres}, user.id)

      if (!newBook) {
        return createFailureResponseByType('book', 'Add book failed')
      }

      return createSuccessResponseByType('book', 'New book added!', newBook)
    },
    deleteBook: async (_, {id}, {user, bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return UNAUTHENTICATED_BOOK_RESPONSE
      }

      const deletedBook = await bookAPI.deleteBook({id}, user.id)

      if (!deletedBook) {
        return createFailureResponseByType('book', 'Delete book failed')
      }

      return createSuccessResponseByType('book', 'Book deleted!', deletedBook)
    },
    registerUser: async (_, {email, password}, {authAPI}) => {
      const user = await authAPI.register(email, password)
      if (!user) {
        return createFailureResponseByType('user', 'User registration failed')
      }

      return createSuccessResponseByType('user', 'User registered!', user)
    },
    editBook: async (_, {bookId, yearOfPublication, rating}, {user, bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return UNAUTHENTICATED_BOOK_RESPONSE
      }

      const editedBook = await bookAPI.editBook({bookId, yearOfPublication, rating}, user.id)

      if (!editedBook) {
        return createFailureResponseByType('book', 'Edit book failed')
      }

      return createSuccessResponseByType('book', 'Book edited!', editedBook)
    },
  },
}

export default mutations
