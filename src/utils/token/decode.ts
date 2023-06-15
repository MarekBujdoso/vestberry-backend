import jwt from 'jsonwebtoken'

interface Decoded {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

function decode (token: string) {
  try {
    const decodedToken: Decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decodedToken
  } catch (error) {
    return null
  }
}

export default decode
