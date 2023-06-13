import {Book, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const addBook = async (book: Book, tx: Prisma.TransactionClient = prisma) => {
  const {title, author, yearOfPublication, rating} = book
  const createdBook = await prisma.book.create({
    data: {
      title,
      author,
      yearOfPublication,
      rating,
    },
  })
  return createdBook
}
