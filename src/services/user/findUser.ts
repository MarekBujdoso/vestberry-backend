import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const findUser = (id: number, email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export default findUser
