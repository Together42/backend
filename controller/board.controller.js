import * as boardRepository from '../data/board.js';
import * as togetherRepository from '../data/together.js';
import * as togetherController from './together.controller.js';

//게시글 생성
export async function createPost(req, res) {
	const { title, contents, eventId, attendMembers } = req.body;
	console.log(attendMembers);
	const writerId = req.userId;
	const post = await boardRepository.createPost({
		writerId,
		title,
		contents,
		eventId
	});
	console.log(post);
	await boardRepository.createAttendMember(attendMembers, post);
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
	const {title, contents, eventId, attendMembers} = req.body;
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
	const updated = await boardRepository.updatePost({id, title, contents, eventId, attendMembers});
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
	if(!board)
		return res.status(400).json({message: '게시글이 없습니다'});
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
4
//파일 업로드

export async function upload(req, res, err) {
	const boardId = req.body.boardId;
	const image = req.files;
	console.log(image.length);
	console.log(req.fileValidationError);
	console.log(image[0]);
	const path = image.map(img => img.path);
	console.log(`path = ${path}`);
	if(req.fileValidationError){//파일이 크거나 형식이 다를때
		return res.status(400).send({message: req.fileValidationError});
	}
	if(image.length < 1){//이미지가 없을때 
		return res.status(400).send(util.fail(400, "이미지가 없습니다"));
	}
		const result = await boardRepository.imageUpload(boardId, image )
		return res.status(200).send(util.success(200, "업로드를 완료했습니다", path));
}

const util = {
	success: (status, message, data) => {
		return {
			status: status,
			success: true,
			message: message,
			data: data
		}
	},
	fail: (status, message) => {
		return {
			status: status,
			success: false,
			message: message
		}
	}
}