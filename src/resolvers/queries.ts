import {BookChanges, Prisma, PrismaClient} from '@prisma/client'
import {QueryResolvers} from '../gql/resolvers-types'
// import authorization from '../services/user/authorization'

const prisma = new PrismaClient()

interface ExtendedBookChange extends BookChanges {
  title: string,
  author: string,
  bookChangeId: number,
}

export const getAllBooks = async (relatedDate: Date, tx: Prisma.TransactionClient = prisma) => {
  const bookChanges: ExtendedBookChange[] = await tx.$queryRaw`SELECT * FROM get_book_changes_by_date(${relatedDate}) 
  WHERE status != 'DELETED'`

  const books = await tx.book.findMany({
    where: {
      id: {
        in: bookChanges.map((bookChange) => bookChange.bookId),
      },
    },
    include: {
      changes: {
        where: {
          id: {
            in: bookChanges.map((bookChange) => bookChange.bookChangeId),
          },
        },
        include: {
          createdBy: true,
        },
      },
    },
  })

  return books
}

// Use the generated `QueryResolvers` type to type check our queries!
const queries: QueryResolvers = {
  Query: {
    getAllFreeBooks: async (_, __, {isAuthenticated}) => {
      if (!isAuthenticated) {
        return {
          code: '401',
          success: false,
          message: 'Unauthorized',
          books: [],
        }
      }

      const books = await getAllBooks(new Date(), prisma)

      return {
        code: '200',
        success: true,
        message: 'all free books',
        books,
      }
    },
    getBookByIdAndDate: async (_, {id, stringDate}, {isAuthenticated}) => {
      if (!isAuthenticated) {
        return {
          code: '401',
          success: false,
          message: 'Unauthorized',
          book: null,
        }
      }

      const books = await getAllBooks(new Date(stringDate), prisma)
      const book = books.find(({id: bookId}) => bookId === id)

      return {
        code: '200',
        success: true,
        message: `book by ${id} and ${stringDate}`,
        book,
      }
    },
    findBooksByTitle: async (_, {title}) => {
      const books = await prisma.book.findMany({
        where: {
          title: {
            contains: title,
          },
        },
        include: {
          changes: {
            include: {
              createdBy: true,
            },
          },
        },
      })

      return {
        code: '200',
        success: true,
        message: 'books by title',
        books,
      }
    },
    findBooksByAuthor: async (_, {author}) => {
      const books = await prisma.book.findMany({
        where: {
          author: {
            contains: author,
          },
        },
        include: {
          changes: {
            include: {
              createdBy: true,
            },
          },
        },
      })

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
        return {
          code: '401',
          success: false,
          message: 'Unauthorized',
          user: null,
        }
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
