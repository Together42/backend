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
	const {loginId, pw, email, url} = user;
	return db
	.execute('INSERT INTO users (loginId, pw, email, url) VALUES (?,?,?,?)',
	[loginId, pw, email, url]
	)
	.then((result) => result[0].insertId);
}