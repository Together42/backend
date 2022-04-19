import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as togetherController from '../controller/together.controller.js';

const router = express.Router();

//router.post('/team',togetherController.team);
router.get('/',togetherController.getTogethers);
router.get('/:id',togetherController.getTogether);
router.post('/', isAuth ,togetherController.createTogether);
router.delete('/:id', isAuth ,togetherController.deleteTogether);
router.post('/register', isAuth ,togetherController.register);
router.delete('/unregister/:id', isAuth ,togetherController.unregister);
router.post('/matching', togetherController.matching);


export default router;