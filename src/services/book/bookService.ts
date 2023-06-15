import {BookChanges, BookStatus, Prisma, PrismaClient} from '@prisma/client'
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

interface ExtendedBookChange extends BookChanges {
  title: string,
  author: string,
  bookChangeId: number,
}

async function getAllBooks (relatedDate: Date, skip?: number, take?: number, tx: Prisma.TransactionClient = prisma) {
  const bookChanges: ExtendedBookChange[] = await tx.$queryRaw`SELECT * FROM get_book_changes_by_date(${relatedDate}) 
  WHERE status != 'DELETED'`

  const books = await tx.book.findMany({
    skip,
    take,
    where: {
      id: {
        in: bookChanges.map((bookChange) => bookChange.bookId),
      },
    },
    include: {
      changes: {
        where: {
          id: {
            in: bookChanges.map((bookChange) => bookChange.bookChangeId),
          },
        },
        include: {
          createdBy: true,
        },
      },
    },
  })

  return books
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

async function findAllBooksBy (attribute: string, value: string, skip?: number, take?: number) {
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

  async getAllBooks (relatedDate: Date, skip?: number, take?: number) {
    return await getAllBooks(relatedDate, skip, take)
  }

  async findBooksByTitle (title: string, skip?: number, take?: number) {
    const books = await findAllBooksBy('title', title, skip, take)

    return books
      .filter(({changes}) => changes.length > 0 && changes[0].status !== 'DELETED')
      .map((book) => ({...book, changes: [book.changes[0]]}))
  }

  async findBooksByAuthor (author: string, skip?: number, take?: number) {
    const books = await findAllBooksBy('author', author, skip, take)

    return books
      .filter(({changes}) => changes.length > 0 && changes[0].status !== 'DELETED')
      .map((book) => ({...book, changes: [book.changes[0]]}))
  }
}

export default new BookService()
