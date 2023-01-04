import { db } from '../db/database.js'

export async function listAllImages() {
  return db
    .execute('SELECT filePath FROM image_info WHERE (filekey REGEXP "^timeline*")')
    .then((result) => result[0])
}
