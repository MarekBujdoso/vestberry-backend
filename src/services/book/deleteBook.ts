import {BookStatus, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const editBook = async (bookId: number, userId: number, tx: Prisma.TransactionClient = prisma) => {
  const deletedBookChange = await tx.bookChanges.create({
    data: {
      bookId,
      status: BookStatus.DELETED,
      createdById: userId,
    },
  })
  return deletedBookChange
}
