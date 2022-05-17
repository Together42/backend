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
		return res.status(404).json({message: 'Post not found'});
	if(deleteId.writerId !== req.userId)//권한
		return res.status(401).json({message: 'UnAuthorization User'});

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
		return res.status(400).json({message: 'title not found'});

	const updateId = await boardRepository.findByPostId(id);
	if(!updateId) {//해당 게시글이 없다면 
		return res.status(404).json({message: 'Post not found'});
	}
	if(updateId.writerId !== req.userId){
		return res.status(401).json({message: 'UnAuthorization User'});
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