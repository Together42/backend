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






export default router;