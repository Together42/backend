import { db } from '../db/database.js'

export async function findByImageFileName(fileName) {
  return db
    .execute('SELECT * FROM image_info where fileName=?',[fileName])
    .then((result) => result[0][0])
}
