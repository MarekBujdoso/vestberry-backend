import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

interface UserData {
  id: number;
  email: string;
}

function encode (user: UserData) {
  const options = {expiresIn: '1h'}
  return jwt.sign(user, process.env.JWT_SECRET, options)
}

export default encode
