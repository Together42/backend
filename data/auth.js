import { db } from '../db/database.js';

export async function findById(id) {
	return db
	.execute('SELECT * FROM users WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function findByLoginId(loginId) {
	return db
	.execute('SELECT * FROM users WHERE loginId=?',[loginId])
	.then((result) => result[0][0]);
}

export async function createUser(user) {
	const {loginId, pw, nickName, email, url} = user;
	return db
	.execute('INSERT INTO users (loginId, pw, nickName, email, url) VALUES (?,?,?,?,?)',
	[loginId, pw, nickName, email, url]
	)
	.then((result) => result[0].insertId);
}