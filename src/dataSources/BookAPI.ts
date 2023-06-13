import {getAllBooks} from '../services/book/getAllBooks'

class BookAPI {
  async getAllFreeBooks () {
    return await getAllBooks()
  }
}

export default BookAPI
