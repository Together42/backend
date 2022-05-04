import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as boardController from '../controller/board.controller.js';

const router = express.Router();

//게시글 조회
router.get('/',boardController.getEventList);

//게시글 상세조회
router.get('/:id',boardController.getEvent);

//게시글 생성
router.post('/', isAuth ,boardController.createEvent);
router.delete('/:id', isAuth ,boardController.deleteEvent);
router.post('/register', isAuth ,boardController.register);
router.delete('/unregister/:id', isAuth ,boardController.unregister);
router.post('/matching', boardController.matching);
router.get('/matching/:id', boardController.getTeam);


export default router;