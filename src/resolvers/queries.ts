import {BookChanges, Prisma, PrismaClient} from '@prisma/client'
import {QueryResolvers} from '../gql/resolvers-types'

const prisma = new PrismaClient()

interface ExtendedBookChange extends BookChanges {
  title: string,
  author: string,
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
        include: {
          genres: true,
        },
      },
    },
  })
  return books
}

// Use the generated `QueryResolvers` type to type check our queries!
const queries: QueryResolvers = {
  Query: {
    getAllFreeBooks: async (_, __) => {
      const [books] = await getAllBooks(new Date(), prisma)
      return {
        code: '200',
        success: true,
        message: 'all free books',
        books,
      }
    },
    getBookByIdAndDate: async (_, {id, stringDate}) => {
      const books = await getAllBooks(new Date(stringDate), prisma)
      console.log(books, stringDate, id)
      const book = books.find(({id: bookId}) => bookId === id)
      return {
        code: '200',
        success: true,
        message: 'book',
        book,
      }
    },

  //   freeBikes: (_, __, { dataSources }) => {
  //     return dataSources.bikes.filter(({ isBorrowed }) => !isBorrowed);
  // }
  //   rents: (_, __, { dataSources }) => {
  //     const { rents, bikes, customers } = dataSources;
  //     return rents.map(({ bikeId, customerId, rentDate, paidTime }) => ({
  //       bikeModel: bikes.find(({ id }) => id === bikeId).model,
  //       customerName: customers.find(({ id }) => id === customerId)
  //         .surename,
  //       rentDate,
  //       paidTime,
  //     }));
  //   },
  },
}

export default queries
