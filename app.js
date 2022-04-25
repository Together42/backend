import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';

// express configuration
const app = express();

//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);

app.listen(config.host.port);
console.log("Listening on", config.host.port);