import {MutationResolvers} from '../gql/resolvers-types'

// Use the generated `MutationResolvers` type to type check our mutations!
const mutations: MutationResolvers = {
  Mutation: {
    addBook: async (_, {title, author, yearOfPublication, rating, genres}, {user, bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return {
          code: '401',
          success: false,
          message: 'Unauthorized',
          book: null,
        }
      }

      const newBook = await bookAPI.addBook({title, author, yearOfPublication, rating, genres}, user.id)

      if (!newBook) {
        return {
          code: '400',
          success: false,
          message: 'Add book failed',
          book: null,
        }
      }

      return {
        code: '200',
        success: true,
        message: 'New book added!',
        book: newBook,
      }
    },
    deleteBook: async (_, {id}, {user, bookAPI, isAuthenticated}) => {
      if (!isAuthenticated) {
        return {
          code: '401',
          success: false,
          message: 'Unauthorized',
          book: null,
        }
      }

      const deletedBook = await bookAPI.deleteBook({id}, user.id)

      if (!deletedBook) {
        return {
          code: '400',
          success: false,
          message: 'Delete book failed',
          book: null,
        }
      }

      return {
        code: '200',
        success: true,
        message: 'Book deleted!',
        book: deletedBook,
      }
    },
  },
}

export default mutations
