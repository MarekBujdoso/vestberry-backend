import {BookStatus, PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const findLastBookChange = async (bookId: number) => {
  const findBook = await prisma.book.findFirst({where: {id: bookId}})
  if (!findBook) {
    // Book does not exist.
    return null
  }

  const lastBookChange = await prisma.bookChanges.findFirst({
    where: {
      bookId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  if (!lastBookChange || lastBookChange.status === BookStatus.DELETED) {
    return null
  }

  return lastBookChange
}

export default findLastBookChange
