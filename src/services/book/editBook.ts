import {Book, BookStatus, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const editBook = async (book: Book, userId: number, tx: Prisma.TransactionClient = prisma) => {
  const {id, title, author, yearOfPublication, rating} = book
  const updatedBook = await tx.book.update({
    where: {
      id,
    },
    data: {
      title,
      author,
      yearOfPublication,
      rating,
    },
  })
  await tx.bookChanges.create({
    data: {
      bookId: id,
      status: BookStatus.EDITED,
      createdById: userId,
    },
  })
  return updatedBook
}
