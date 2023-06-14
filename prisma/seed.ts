import {Genres, PrismaClient} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    const {password} = params.args.data
    const salt = bcrypt.genSaltSync(10)
    params.args.data.password = bcrypt.hashSync(password, salt)
  }
  return next(params)
})

const BOOKS = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    changes: {
      create: [
        {
          yearOfPublication: 1925,

          createdById: 1,
          genres: {
            create: [
              {name: Genres.ROMANCE},
              {name: Genres.FANTASY}
            ],
          },
          rating: 3,
        },
      ],
    },
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    changes: {
      create: [
        {
          yearOfPublication: 2003,
          createdById: 1,
          genres: {
            create: [
              {name: Genres.MYSTERY},
              {name: Genres.THRILLER},
            ],
          },
          rating: 4,
        },
      ],
    },
  },
  {
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    changes: {
      create: [
        {
          yearOfPublication: 1937,
          genres: {
            create: [
              {name: Genres.FANTASY}
            ],
          },
          rating: 5,
          createdById: 1,
        },
      ],
    },
  },
]

const USERS = [
  {
    email: 'aaa@vestberry.com',
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
    console.debug(createdUser)
  }
  const allUsers = await prisma.user.findMany()
  console.debug(allUsers)

  for (const book of BOOKS) {
    const {changes, ...rest} = book
    const createdBook = await prisma.book.create({
      data: {
        ...rest,
        changes: {
          create: changes.create,
        }
      },
    })
    console.debug(createdBook)
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
