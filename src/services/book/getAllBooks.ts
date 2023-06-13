import {BookStatus, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const getAllBooks = async (tx: Prisma.TransactionClient = prisma) => {
  const books = await prisma.book.findMany({
    where: {
      status: {in: [BookStatus.NEW, BookStatus.EDITED]}
    },
  })
  return books
}
