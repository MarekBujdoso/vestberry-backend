import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export interface RegisterLoginInput {
  email: string;
  password: string;
}

class Authorization {
//   async register(input: RegisterLoginInput): Promise<User | null> {
//     if (await User.findOne({ where: { email: input.email } })) return null;

//     return User.create({ ...input });
//   }

  async login (email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    })

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
