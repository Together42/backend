import { db } from '../db/database.js';

export async function findByPostId(id) {
	return db
	.execute('SELECT * FROM board WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function deletePost(id) {
	return db.execute('DELETE FROM board WHERE id=?',[id]);
}

export async function createPost(post) {
	const {writerId, title, contents, image, eventId} = post;
	return db
	.execute('INSERT INTO board (writerId, title, contents, image, eventId) VALUES (?,?,?,?,?)',
	[writerId, title, contents, image, eventId]
	)
	.then((result) => result[0].insertId);
}

export async function updatePost(post) {
	const {id, title, contents, image, eventId, attendMembers} = post;
	return db.execute('UPDATE board SET title=? ,contents=? ,image=? ,eventId=? ,attendMembers=? WHERE id=?',
	[title, contents, image, eventId, attendMembers, id])
	.then(()=> findByPostId(id));
}

export async function getBoardList(eventId){
	let query;
	if(eventId){
		query = `
		SELECT 
		board.id,
		board.eventId,
		board.title, 
		board.writerId,
		board.contents,
		board.createdAt,
		board.updatedAt, 
		board.image,
		count(board_comment.id) as commentNum,
		us.url
	FROM board
	LEFT JOIN users as us ON board.writerId = us.id
	LEFT JOIN board_comment ON board.id=board_comment.boardId
	WHERE board.eventId = ${eventId}
	GROUP BY board.id;`
	}else {
		query = `
		SELECT 
			board.id,
			board.eventId,
			board.title, 
			board.writerId,
			board.contents,
			board.createdAt,
			board.updatedAt, 
			board.image,
			count(board_comment.id) as commentNum,
			us.url
		FROM board
		LEFT JOIN users as us ON board.writerId = us.id
		LEFT JOIN board_comment ON board.id=board_comment.boardId
		GROUP BY board.id;
		`
	}
	return db
	.query(`${query}`)
	.then((result)=>result[0]);
}

export async function getBoard(boardId){
	return db
	.query(`	
		SELECT 
			board.id,
			board.eventId,
			board.title, 
			board.writerId,
			board.contents,
			board.createdAt,
			board.updatedAt, 
			board.image,
			us.url
		FROM board
		LEFT JOIN users as us ON board.writerId = us.id
		WHERE board.id = ?
			`,[boardId])
	.then((result)=>result[0][0]);
}

export async function getAttendMembers(boardId){
	return db
	.query(`	
		SELECT users.intraId, users.url FROM board_attend_members as bam JOIN users ON users.intraId=bam.intraId WHERE boardId = ?
			`,[boardId])
	.then((result)=>result[0]);
}

export async function getComments(boardId){
	return db
	.query(`	
		SELECT
		users.intraId,
		bc.comments
		FROM board_comment as bc
		JOIN users ON users.id=bc.writerId
		WHERE boardId = ?
		;
			`,[boardId])
	.then((result)=>result[0]);
}

export async function createAttendMember(members, boardId) {
	const values = members.map(member => {
		return [member.intraId , boardId]});
	console.log(values);
	return db
	.query('INSERT INTO board_attend_members (intraId,boardId) VALUES ?',[values])
	.then((result)=>result[0]);
}