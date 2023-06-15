import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const loadBookAndIncludeLatest = async (bookId: number, bookChangeId: number) => {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
    },
    include: {
      changes: {
        where: {
          id: bookChangeId,
        },
        include: {
          createdBy: true,
        },
      },
    },
  })

  return book
}

export default loadBookAndIncludeLatest
