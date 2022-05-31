import { db } from '../db/database.js';
import {config} from '../config.js';

export async function findByPostId(id) {
	return db
	.execute('SELECT * FROM board WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function deletePost(id) {
	return db.execute('DELETE FROM board WHERE id=?',[id]);
}

export async function deleteComment(id) {
	return db.execute('DELETE FROM board_comment WHERE id=?',[id]);
}

export async function createPost(post) {
	const {writerId, title, contents, eventId} = post;
	return db
	.execute('INSERT INTO board (writerId, title, contents, eventId) VALUES (?,?,?,?)',
	[writerId, title, contents, eventId]
	)
	.then((result) => result[0].insertId);
}

export async function createComment(boardId, comment, writerId) {
	return db
	.execute('INSERT INTO board_comment (boardId, comments, writerId) VALUES (?,?,?)',
	[boardId, comment, writerId]
	)
	.then((result) => result[0].insertId);
}

export async function updatePost(post) {
	const {id, title, contents, eventId } = post;
	return db.execute('UPDATE board SET title=? ,contents=? ,eventId=? WHERE id=?',
	[title, contents, eventId, id])
	.then(()=> findByPostId(id));
}

export async function updateComment(comment, id) {
	return db.execute('UPDATE board_comment SET comments = ? WHERE id=?',
	[comment, id])
	.then(()=> findByCommentId(id));
}

export async function getBoardList(eventId){
	let query;
	if(eventId){
		query = `
		SELECT 
		board.id as boardId,
		board.eventId,
		board.title, 
		us.intraId,
		board.contents,
		board.createdAt,
		board.updatedAt,
		count(board_comment.id) as commentNum,
		us.url,
		(SELECT filePath FROM image_info WHERE boardNum = board.id LIMIT 1) as filePath
	FROM board
	LEFT JOIN users as us ON board.writerId = us.id
	LEFT JOIN board_comment ON board.id=board_comment.boardId
	WHERE board.eventId = ${eventId}
	GROUP BY board.id;`
	}else {
		query = `
		SELECT 
			board.id as boardId,
			board.eventId,
			board.title, 
			us.intraId,
			board.contents,
			board.createdAt,
			board.updatedAt,
			count(board_comment.id) as commentNum,
			us.url,
			(SELECT filePath FROM image_info WHERE boardNum = board.id LIMIT 1) as filePath
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
			board.id as boardId,
			board.eventId,
			board.title, 
			us.intraId,
			board.contents,
			board.createdAt,
			board.updatedAt,
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
		bc.id,
		users.intraId,
		bc.comments,
		bc.updatedAt
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
export async function checkAttendMember(members)
{
	const values = members.map(member => {
		return [`"${member.intraId}"`]});
	const sql = `SELECT intraId FROM users WHERE intraId IN (${values.toString()})`
	return db
	.query(sql)
	.then((result)=>result[0]);
}

export async function findByCommentId(id) {
	return db
	.execute('SELECT * FROM board_comment WHERE id=?',[id])
	.then((result) => result[0][0]);
}

//upload

export async function imageUpload(boardId, images) {
	const values = images.map(image => {
		return [boardId, image.location, image.originalname, image.mimetype, image.size, image.key]
	})
	console.log(`value : ${values}`);
	return db
	.query('INSERT INTO image_info (boardNum, filePath, fileName, fileType, fileSize, fileKey) VALUES ?',
	[values])
	.then((result) => result[0].insertId)
	.catch((error) => error);
}

export async function getImages(boardId){
	console.log(`getImage = ${boardId}`);
	return db
	.query(`	
		SELECT id as imageId, boardNum as boardId, filePath FROM image_info WHERE boardNum = ?
			`,[boardId])
	.then((result)=>result[0]);
}

export async function findByImageId(id) {
	return db
	.execute('SELECT * FROM image_info WHERE id=?',[id])
	.then((result) => result[0][0]);
}

export async function deleteImage(id) {
	return db.execute('DELETE FROM image_info WHERE id=?',[id]);
}