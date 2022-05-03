import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as togetherController from '../controller/together.controller.js';

const router = express.Router();

router.get('/',togetherController.getEventList);
router.get('/:id',togetherController.getEvent);
router.post('/', isAuth ,togetherController.createEvent);
router.delete('/:id', isAuth ,togetherController.deleteEvent);
router.post('/register', isAuth ,togetherController.register);
router.delete('/unregister/:id', isAuth ,togetherController.unregister);
router.post('/matching', isAuth, togetherController.matching);
router.get('/matching/:id', togetherController.getTeam);


export default router;