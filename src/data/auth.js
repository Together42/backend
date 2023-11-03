import { db } from "../db/database.js";

export async function findById(id) {
  return db
    .execute("SELECT * FROM users WHERE id=?", [id])
    .then((result) => result[0][0]);
}

export async function findByintraId(intraId) {
  return db
    .execute("SELECT * FROM users WHERE intraId=?", [intraId])
    .then((result) => result[0][0]);
}

export async function findByEmail(email) {
  return db
    .execute("SELECT * FROM users WHERE email=?", [email])
    .then((result) => result[0][0]);
}

export async function createUser(user) {
  const { intraId, password, email, profile } = user;
  return db
    .execute(
      "INSERT INTO users (intraId, password, email, profile) VALUES (?,?,?,?)",
      [intraId, password, email, profile],
    )
    .then((result) => result[0].insertId);
}

export async function getByUserList() {
  return db
    .execute("SELECT id, intraId, profile FROM users")
    .then((result) => result[0]);
}

export async function updatePassword(userInfo) {
  const { id, intraId, password } = userInfo;
  return db
    .execute("UPDATE users SET password=? WHERE id=?", [password, id])
    .then(() => findById(id));
}

export async function findUsersByIdList(idList) {
  const placeholder = idList.map(() => "?");
  return db
    .execute(`select intraId from users where id in (${placeholder})`, [
      ...idList,
    ])
    .then((result) => result[0]);
}
