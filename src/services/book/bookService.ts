import {BookStatus, PrismaClient} from '@prisma/client'
import {Genres} from '../../gql/resolvers-types'
import loadBookAndIncludeLatest from './loadBookAndIncludeLatest.js'
import getAllBooks from './getAllBooks.js'
import findLastBookChange from './findLastBookChange.js'
import findAllBooksBy from './findAllBooksBy.js'

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

    const newBookChange = await prisma.bookChanges.create({
      data: {
        yearOfPublication,
        rating,
        bookId: newBook.id,
        createdById: userId,
      }
    })

    return await loadBookAndIncludeLatest(newBook.id, newBookChange.id)
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

    return await loadBookAndIncludeLatest(id, newBookChange.id)
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

    return await loadBookAndIncludeLatest(bookId, newBookChange.id)
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
