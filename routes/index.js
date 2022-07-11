import { Router } from 'express';
import authRouter from './auth.routes.js';
import togetherRouter from './together.routes.js';
import boardRouter from './board.routes.js';
import slackRouter from './slack.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/together', togetherRouter);
router.use('/board', boardRouter);
router.use('/slack', slackRouter);

export default router;