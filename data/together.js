import { db } from '../db/database.js';

//export async function getTogethers(){
//	return db
//	.execute('SELECT * FROM together')
//	.then((result)=>result[0]);
//}

//export async function findByTogetherId(id) {
//	return db
//	.execute('SELECT * FROM together WHERE id=?',[id])
//	.then((result) => result[0][0]);
//}

//export async function deleteTogether(id) {
//	return db.execute('DELETE FROM together WHERE id=?',[id]);
//}

export async function createTogether(together) {
	const {title, description} = together;
	return db
	.execute('INSERT INTO together (title, description) VALUES (?,?)',
	[title, description]
	)
	.then((result) => result[0].insertId);
}