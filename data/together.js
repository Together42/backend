import { db } from '../db/database.js';

export async function getTogethers(){
	return db
	.execute('SELECT * FROM together')
	.then((result)=>result[0]);
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

export async function getAttendUserId(togetherId){
	return db
	.execute('SELECT * FROM attend WHERE togetherId=?',[togetherId])
	.then((result)=>result[0].map(attend => attend.userId));
}

export async function createTeam(teamId, togetherId, userId)
{
	return db
	.execute('INSERT INTO team (teamId, togetherId, userId) VALUES (?,?,?)',
	[teamId, togetherId, userId])
	.then((result)=> result[0].insertId);
}

export async function getTeams(togetherId){
	return db
	.execute('SELECT * FROM team WHERE togetherId=? ORDER BY teamId ASC',[togetherId])
	.then((result)=>result[0]);
}

export async function getTeam(togetherId, teamId){
	return db
	.execute('SELECT * FROM team WHERE togetherId=? && teamId=?',[togetherId, teamId])
	.then((result)=>result[0]);
}

export async function findByTeamTogetherId(togetherId) {
	return db
	.execute('SELECT * FROM team WHERE togetherId=?',[togetherId])
	.then((result) => result[0][0]);
}