import { Router } from 'express';
import authRouter from './auth.js';
import togetherRouter from './together.js';
import boardRouter from './board.js';
import slackRouter from './slack.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/together', togetherRouter);
router.use('/board', boardRouter);
router.use('/slack', slackRouter);

export default router;