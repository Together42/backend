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

export async function getBoardList(){
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
			bc.id as commentId,
			bc.writerId,
			bc.comments,
			bam.intraId,
			us.url
		FROM board 
		LEFT JOIN board_comment as bc ON board.id=bc.boardId
		LEFT JOIN board_attend_members as bam ON board.id=bam.boardId
		LEFT JOIN users as us ON bam.intraId = us.intraId;
					`)
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