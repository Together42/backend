import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as togetherController from '../controller/together.controller.js';

const router = express.Router();

router.post('/team',togetherController.team);

export default router;