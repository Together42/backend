import express from 'express';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as slackController from '../controller/slack.controller.js';

const router = express.Router();

router.post('/',slackController.publishMessages);



export default router;