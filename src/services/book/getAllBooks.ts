import {BookChanges, Prisma, PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

interface ExtendedBookChange extends BookChanges {
  title: string,
  author: string,
  bookChangeId: number,
}

const getAllBooks = async (relatedDate: Date, skip?: number, take?: number, tx: Prisma.TransactionClient = prisma) => {
  const bookChanges: ExtendedBookChange[] = await tx.$queryRaw`SELECT * FROM get_book_changes_by_date(${relatedDate}) 
  WHERE status != 'DELETED'`

  const books = await tx.book.findMany({
    skip,
    take,
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

export default getAllBooks
