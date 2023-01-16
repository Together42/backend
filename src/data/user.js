import { db } from "../db/database.js";

export async function getUserList() {
  console.log(db.execute("SELECT intraId FROM users"));
  return db
    .execute("SELECT id, intraId, profile FROM users")
    .then((result) => result[0]);
}

export async function findUserById(id) {
  return db
    .execute("SELECT * FROM users WHERE id=?", [id])
    .then((result) => result[0][0]);
}
