import {BookStatus, BookChanges, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

interface ExtendedBookChange extends BookChanges {
  title: string,
  author: string,
  yearOfPublication: number,
  rating: number
}

export const getAllBooks = async (tx: Prisma.TransactionClient = prisma) => {
  const bookChanges: ExtendedBookChange[] = await tx.$queryRaw`SELECT * FROM get_get_book_changes_by_date(NOW()) 
  WHERE status != ${BookStatus.DELETED}`
  const books = await tx.book.findMany({
    where: {
      id: {
        in: bookChanges.map((bookChange) => bookChange.bookId),
      },
    },
  })
  return books
}
