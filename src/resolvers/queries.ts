import {QueryResolvers} from '../gql/resolvers-types'
import {
  UNAUTHENTICATED_BOOK_RESPONSE,
  UNAUTHENTICATED_BOOKS_RESPONSE,
  UNAUTHORIZED_USER_RESPONSE
} from './resolverConstants.js'

// Use the generated `QueryResolvers` type to type check our queries!
const queries: QueryResolvers = {
  Query: {
    getAllAvailableBooks: async (_, {skip, take}, {bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return UNAUTHENTICATED_BOOKS_RESPONSE
      }

      const books = await bookAPI.getAllBooks(new Date(), skip, take)

      return {
        code: '200',
        success: true,
        message: 'all free books',
        books,
      }
    },
    getBookByIdAndDate: async (_, {id, stringDate, skip, take}, {bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return UNAUTHENTICATED_BOOK_RESPONSE
      }

      const books = await bookAPI.getAllBooks(new Date(stringDate), skip, take)
      const book = books.find(({id: bookId}) => bookId === id)

      return {
        code: '200',
        success: true,
        message: `book by ${id} and ${stringDate}`,
        book,
      }
    },
    findBooksByTitle: async (_, {title, skip, take}, {bookAPI}) => {
      const books = await bookAPI.findBooksByTitle(title, skip, take)

      return {
        code: '200',
        success: true,
        message: 'books by title',
        books,
      }
    },
    findBooksByAuthor: async (_, {author, skip, take}, {bookAPI}) => {
      const books = await bookAPI.findBooksByAuthor(author, skip, take)

      return {
        code: '200',
        success: true,
        message: 'books by author',
        books,
      }
    },
    logIn: async (_, {email, password}, {authAPI}) => {
      const user = await authAPI.login(email, password)

      if (!user) {
        return UNAUTHORIZED_USER_RESPONSE
      }

      return {
        code: '200',
        success: true,
        message: 'user logged in',
        user,
      }
    },
  },
}

export default queries
