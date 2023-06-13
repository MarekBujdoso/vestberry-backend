import {Genres, PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const BOOKS = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    yearOfPublication: 1925,
    genres: {
      create: [
        {name: Genres.ROMANCE},
        {name: Genres.FANTASY}
      ],
    },
    rating: 3,
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    yearOfPublication: 2003,
    genres: {
      create: [
        {name: Genres.MYSTERY},
        {name: Genres.THRILLER},
      ]
    },
    rating: 4,
  },
  {
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    yearOfPublication: 1937,
    genres: {
      create: [
        {name: Genres.FANTASY}
      ],
    },
    rating: 5,
  },
]

const USERS = [
  {
    email: 'aaa@vestebry.com',
    password: 'aaa',
  },
  {
    email: 'name@gmail.com',
    password: 'name',
  },
]

async function main () {
  for (const user of USERS) {
    const createdUser = await prisma.user.create({
      data: user,
    })
    console.log(createdUser)
  }
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)

  for (const book of BOOKS) {
    const {genres, ...rest} = book
    const createdBook = await prisma.book.create({
      data: {
        ...rest,
        genres: {
          create: genres.create,
        }
      },
    })
    const createdBookStatus = await prisma.bookChanges.create({
      data: {
        bookId: createdBook.id,
        createdById: allUsers[0].id,
      },
    })
    console.log(createdBook, createdBookStatus)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
