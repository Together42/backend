import * as boardRepository from '../data/board.js';
import * as userRepository from '../data/auth.js';

//게시글 생성
export async function createPost(req, res) {
	const { title, contents, image, eventId, attendMembers } = req.body;
	const writerId = req.userId;
	const post = await boardRepository.createPost({
		writerId,
		title,
		contents,
		image,
		eventId,
		attendMembers
	});
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
	const updateId = await boardRepository.findByPostId(id);
	if(!updateId) {//해당 게시글이 없다면 
		return res.sendStatus(404);
	}
	if(updateId.writerId !== req.userId){
		return res.sendStatus(403); //로그인됐지만 권한없을때
	}
	console.log("tkim");
	const updated = await boardRepository.updatePost(id, title, contents, image, eventId, attendMembers);
	res.status(200).json(updated);
}

