import { db } from '../db/database.js';

export async function getTogethers(){
	return db
	.execute('SELECT * FROM together')
	.then((result)=>result[0]);
}

export async function getTogether(id){
	return db
	.execute('SELECT * FROM together WHERE id=?',[id])
	.then((result)=>result[0][0]);
}

export async function findByTogetherId(id) {
	return db
	.execute('SELECT * FROM together WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function deleteTogether(id) {
	return db.execute('DELETE FROM together WHERE id=?',[id]);
}

export async function createTogether(together) {
	const {title, description} = together;
	return db
	.execute('INSERT INTO together (title, description) VALUES (?,?)',
	[title, description]
	)
	.then((result) => result[0].insertId);
}

export async function register(user, togetherId) {
	return db
	.execute('INSERT INTO attend (userId, togetherId) VALUES (?,?)',
	[user, togetherId]
	)
	.then((result)=> result[0].insertId);
}

export async function unregister(user, togetherId) {
	return db
	.execute('DELETE FROM attend WHERE userId=? && togetherId=?',
	[user, togetherId]
	)
}

export async function findByAttend(user, togetherId) {
	return db
	.execute('SELECT * FROM attend WHERE userId=? && togetherId=?',
	[user, togetherId]
	)
	.then((result) => result[0][0]);
}