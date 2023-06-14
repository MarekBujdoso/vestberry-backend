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
    const findBook = await prisma.book.findFirst({where: {id}})
    if (!findBook) {
      // Book does not exist.
      return null
    }

    const lastBookChange = await prisma.bookChanges.findFirst({
      where: {
        bookId: id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (!lastBookChange || lastBookChange.status === BookStatus.DELETED) {
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
}

export default new BookService()
