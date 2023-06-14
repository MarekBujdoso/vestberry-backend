import {BookStatus, PrismaClient} from '@prisma/client'
import {Genres} from '../../gql/resolvers-types'

const prisma = new PrismaClient()

interface Book {
  title: string;
  author: string;
  yearOfPublication: number;
  rating: number;
  genres: Genres;
}

interface BookChange {
  bookId: number;
  yearOfPublication?: number;
  rating?: number;
}

async function findLastBookChange (bookId: number) {
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

class BookService {
  async addBook ({title, author, yearOfPublication, rating, genres}: Book, userId: number) {
    const findBook = await prisma.book.findUnique({where: {title}})

    if (findBook) {
      // Book already exists.
      return null
    }

    const newBook = await prisma.book.create({
      data: {title, author, genres}
    })

    await prisma.bookChanges.create({
      data: {
        yearOfPublication,
        rating,
        bookId: newBook.id,
        createdById: userId,
      }
    })

    // await prisma.genre.createMany({
    //   data: genres.map((name: Genres) => ({name, bookChangeId: newBookChange.id}))
    // })

    return await prisma.book.findUnique({
      where: {
        title,
      },
      include: {
        changes: {
          include: {
            createdBy: true,
          },
        },
      },
    })
  }

  async deleteBook ({id}: {id: number}, userId: number) {
    const lastBookChange = await findLastBookChange(id)

    if (!lastBookChange) {
      return null
    }

    const {yearOfPublication, rating} = lastBookChange
    const newBookChange = await prisma.bookChanges.create({
      data: {
        yearOfPublication,
        rating,
        bookId: id,
        createdById: userId,
        status: BookStatus.DELETED,
      }
    })

    return await prisma.book.findFirst({
      where: {
        id,
      },
      include: {
        changes: {
          where: {
            id: newBookChange.id,
          },
          include: {
            createdBy: true,
          },
        },
      },
    })
  }

  async editBook ({bookId, yearOfPublication, rating}: BookChange, userId: number) {
    const lastBookChange = await findLastBookChange(bookId)

    if (!lastBookChange) {
      return null
    }

    const newBookChange = await prisma.bookChanges.create({
      data: {
        yearOfPublication: yearOfPublication || lastBookChange.yearOfPublication,
        rating: rating || lastBookChange.rating,
        bookId,
        createdById: userId,
        status: BookStatus.EDITED,
      }
    })

    return await prisma.book.findFirst({
      where: {
        id: bookId,
      },
      include: {
        changes: {
          where: {
            id: newBookChange.id,
          },
          include: {
            createdBy: true,
          },
        },
      },
    })
  }
}

export default new BookService()
