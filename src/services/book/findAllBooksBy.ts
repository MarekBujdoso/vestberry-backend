import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const findAllBooksBy = async (attribute: string, value: string, skip?: number, take?: number) => {
  const books = await prisma.book.findMany({
    skip,
    take,
    where: {
      [attribute]: {
        contains: value,
      },
    },
    include: {
      changes: {
        include: {
          createdBy: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  return books
}

export default findAllBooksBy
