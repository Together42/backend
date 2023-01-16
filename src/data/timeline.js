import { db } from "../db/database.js";

export async function listAllImages() {
  return db
    .execute(
      "SELECT filePath FROM image_info WHERE (filekey REGEXP \"^timeline*\")",
    )
    .then((result) => result[0]);
}

export async function imageUpload(boardId, images) {
  const values = images.map((image) => {
    return [
      boardId,
      image.location,
      image.originalname,
      image.mimetype,
      image.size,
      image.key,
    ];
  });
  console.log(`value : ${values}`);
  return db
    .query(
      "INSERT INTO image_info (boardNum, filePath, fileName, fileType, fileSize, fileKey) VALUES ?",
      [values],
    )
    .then((result) => result[0].insertId)
    .catch((error) => error);
}