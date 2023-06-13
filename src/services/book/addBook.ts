import {Book, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const addBook = async (book: Book, userId: number, tx: Prisma.TransactionClient = prisma) => {
  const {title, author, yearOfPublication, rating} = book
  const createdBook = await tx.book.create({
    data: {
      title,
      author,
      yearOfPublication,
      rating,
    },
  })
  await tx.bookChanges.create({
    data: {
      bookId: createdBook.id,
      createdById: userId,
    },
  })
  return createdBook
}
