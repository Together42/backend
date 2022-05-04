import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';
import boardRouter from './routes/board.js';
import { stream } from './config/winston.js';
import cors from 'cors';
import * as fs  from 'fs';
import https from 'https';

// express configuration
const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(morgan('combined', {stream}));

app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);
app.use('/api/board', boardRouter);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(config.host.port, () => {
	console.log('HTTPS Server running on', config.host.port);
});


//app.listen(config.host.port);
//console.log("Listening on", config.host.port);
