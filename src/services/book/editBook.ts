import {Book, BookStatus, PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const editBook = async (book: Book, tx: Prisma.TransactionClient = prisma) => {
  const {id, title, author, yearOfPublication, rating} = book
  const createdBook = await prisma.book.update({
    where: {
      id
    },
    data: {
      title,
      author,
      yearOfPublication,
      rating,
      status: BookStatus.EDITED
    },
  })
  return createdBook
}
