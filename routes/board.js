import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as boardController from '../controller/board.controller.js';

const router = express.Router();

////게시글 전체조회
router.get('/',boardController.getBoardList);

//게시글 생성
router.post('/', isAuth ,boardController.createPost);

//게시글 삭제
router.delete('/:id', isAuth ,boardController.deletePost);

//게시글 수정
router.put('/:id', isAuth ,boardController.updatePost);

////게시글 상세조회
router.get('/:id',boardController.getBoardDetail);

//댓글 생성
router.post('/comment', isAuth, boardController.createComment);

//댓글 수정
router.put('/comment/:id', isAuth, boardController.updateComment);

//댓글 삭제
router.delete('/comment/:id', isAuth, boardController.deleteComment);




export default router;