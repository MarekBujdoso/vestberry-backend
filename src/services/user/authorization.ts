import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

class Authorization {
  async register (email: string, password: string) {
    const findUser = await prisma.user.findUnique({where: {email}})

    if (findUser) {
      // User already exists.
      return null
    }

    return await prisma.user.create({
      data: {email, password}
    })
  }

  async login (email: string, password: string) {
    const user = await prisma.user.findUnique({where: {email}})

    if (!user) {
      return null
    }

    // const valid = await bcrypt.compare(password, user.password)
    const isPasswordValid = user.password === password
    if (!isPasswordValid) {
      return null
    }

    return user
  }
}

export default new Authorization()
