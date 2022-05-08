import { db } from '../db/database.js';

export async function findById(id) {
	return db
	.execute('SELECT * FROM users WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function findByintraId(intraId) {
	return db
	.execute('SELECT * FROM users WHERE intraId=?',[intraId])
	.then((result) => result[0][0]);
}

export async function findByEmail(email) {
	return db
	.execute('SELECT * FROM users WHERE email=?',[email])
	.then((result) => result[0][0]);
}

export async function createUser(user) {
	const {intraId, password, email, url} = user;
	return db
	.execute('INSERT INTO users (intraId, password, email, url) VALUES (?,?,?,?)',
	[intraId, password, email, url]
	)
	.then((result) => result[0].insertId);
}