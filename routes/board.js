import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as boardController from '../controller/board.controller.js';

const router = express.Router();

//게시글 전체조회
router.get('/',boardController.openBoardList);

//게시글 상세조회
router.get('/:id',boardController.openBoardDetail);

//게시글 생성
router.post('/write', isAuth ,boardController.createPost);

//게시글 생성을 위한 조회
router.get('/write', isAuth ,boardController.getBoardWrite);

//게시글 삭제
router.delete('/:id', isAuth ,boardController.deletePost);

//게시글 수정
router.put('/:id', isAuth ,boardController.updatePost);


export default router;