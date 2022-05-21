import * as boardRepository from '../data/board.js';
import * as togetherRepository from '../data/together.js';
import * as togetherController from './together.controller.js';

//게시글 생성
export async function createPost(req, res) {
	const { title, contents, image, eventId, attendMembers } = req.body;
	console.log(attendMembers);
	const writerId = req.userId;
	const post = await boardRepository.createPost({
		writerId,
		title,
		contents,
		image,
		eventId
	});
	console.log(post);
	const attendMember = await boardRepository.createAttendMember(attendMembers, post);
	res.status(201).json({post});
}

//게시글 삭제
export async function deletePost(req, res){
	const id = req.params.id;
	const deleteId = await boardRepository.findByPostId(id);
	console.log(deleteId);

	if(!deleteId) //삭제할 글이 없다면
		return res.status(404).json({message: '삭제할 게시글이 없습니다'});
	if(deleteId.writerId !== req.userId)//권한
		return res.status(401).json({message: '권한이 없습니다'});

	await boardRepository.deletePost(id);
	res.sendStatus(204);
}

//게시글 수정
//일단 제목, 내용만 수정가능, / 사진은 추후에
export async function updatePost (req, res) {
	const id = req.params.id;
	const {title, contents, image, eventId, attendMembers} = req.body;
	//제목이 없을시 에러
	if(title == '')
		return res.status(400).json({message: '제목을 넣어주세요'});

	const updateId = await boardRepository.findByPostId(id);
	if(!updateId) {//해당 게시글이 없다면 
		return res.status(404).json({message: '게시글이 없습니다'});
	}
	if(updateId.writerId !== req.userId){
		return res.status(401).json({message: '권한이 없습니다'});
	}
	const updated = await boardRepository.updatePost({id, title, contents, image, eventId, attendMembers});
	res.status(200).json({updated});
}
export async function getBoardList(req, res){
	const eventId = req.query.eventId;
	console.log(`eventId = ${eventId}`);
	const boardList = await boardRepository.getBoardList(eventId);
	console.log(boardList);
	//const attendList = await boardRepository.getAttendList();
	res.status(200).json({boardList});
}

export async function getBoardDetail(req, res){
	const boardId = req.params.id;
	const board = await boardRepository.getBoard(boardId);
	const attendMembers = await boardRepository.getAttendMembers(boardId);
	const comments = await boardRepository.getComments(boardId);
	board.attendMembers = attendMembers;
	board.comments = comments;
	console.log(board);
	
	res.status(200).json(board);
}

//comment

export async function createComment(req, res){
	const {boardId, comment} = req.body;
	const writerId = req.userId;
	console.log(`boardId = ${boardId}, comment = ${comment}, writerId = ${writerId}`);
	const result = await boardRepository.createComment(boardId, comment, writerId);
	
	res.status(200).json({result});
}

export async function updateComment(req, res){
	const id = req.params.id;
	const comment = req.body.comment;
	const writerId = req.userId;
	console.log(`comment = ${comment}, writerId = ${writerId}`);
	const commentId = await boardRepository.findByCommentId(id);
	if(writerId !== commentId.writerId)
		return res.status(401).json({message: '권한이 없습니다'});

	const comments = await boardRepository.updateComment(comment,id);
	console.log(comments);
	res.status(200).json({comments});
}

export async function deleteComment(req, res){
	const id = req.params.id;
	const deleteId = await boardRepository.findByCommentId(id);
	console.log(deleteId);

	if(!deleteId) //삭제할 댓글이 없다면
		return res.status(404).json({message: '삭제할 댓글이 없습니다'});
	if(deleteId.writerId !== req.userId)//권한
		return res.status(401).json({message: '권한이 없습니다'});

	await boardRepository.deleteComment(id);
	res.sendStatus(204);
}