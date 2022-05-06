import { db } from '../db/database.js';

export async function getEventList(){
	return db
	.execute('SELECT ev.id, ev.title, ev.description at.teamId FROM event_info as ev JOIN attendance_info as at ON ev.id=at.id ')
	.then((result)=>console.log(result[0]));
}

export async function findByPostId(id) {
	return db
	.execute('SELECT * FROM board WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function deletePost(id) {
	return db.execute('DELETE FROM board WHERE id=?',[id]);
}

export async function createPost(post) {
	const {writerId, title, contents, image, eventId, attendMembers} = post;
	return db
	.execute('INSERT INTO board (writerId, title, contents, image, eventId, attendMembers) VALUES (?,?,?,?,?,?)',
	[writerId, title, contents, image, eventId, attendMembers]
	)
	.then((result) => result[0].insertId);
}

export async function updatePost(post) {
	const {id, title, contents, image, eventId, attendMembers} = post;

	return db.execute('UPDATE board SET title=? contents=? image=? eventId=? attendMembers=? WHERE id=?',
	[title, contents, image, eventId, attendMembers, id])
	.then(()=> findByPostId(id));
}