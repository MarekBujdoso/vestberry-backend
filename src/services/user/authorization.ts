import {PrismaClient} from '@prisma/client'
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

class Authorization {
  async register (email: string, password: string) {
    const findUser = await prisma.user.findUnique({where: {email}})

    if (findUser) {
      // User already exists.
      return null
    }

    const newUser = await prisma.user.create({
      data: {email, password}
    })

    return newUser
  }

  async login (email: string, password: string) {
    const user = await prisma.user.findUnique({where: {email}})

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    return user
  }
}

export default new Authorization()
