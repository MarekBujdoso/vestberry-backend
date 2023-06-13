import {BookStatus, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const editBook = async (bookId: number, tx: Prisma.TransactionClient = prisma) => {
  const deletedBook = await prisma.book.update({
    where: {
      id: bookId
    },
    data: {
      status: BookStatus.DELETED
    },
  })
  return deletedBook
}
