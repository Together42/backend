import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import * as fs  from 'fs';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';
import boardRouter from './routes/board.js';
import slackRouter from './routes/slack.js';
import { stream } from './config/winston.js';
import https from 'https';
import rateLimit from './middleware/rate-limiter.js';
// express configuration
const app = express();
const __dirname = path.resolve();
let credentials;
if(config.hostname.hostname === 'ec2')
{
	const privateKey = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/privkey.pem', 'utf8');
	const certificate = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/cert.pem', 'utf8');
	const ca = fs.readFileSync('/etc/letsencrypt/live/together.42jip.com/chain.pem', 'utf8');
	credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};
}
//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({
	origin: [
	  'http://localhost:3050',
	  'http://10.18.245.57:3050',
	  'http://10.19.230.111:3050',
	  'https://together42.github.io',
	],
	credentials: true,
  }));
app.use(morgan('combined', {stream}));
app.use(rateLimit)
app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);
app.use('/api/board', boardRouter);
app.use('/api/slack', slackRouter);

if(config.hostname.hostname === 'ec2')
{
	console.log('host ec2');
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(config.host.port, () => {
		console.log('HTTPS Server running on', config.host.port);
	});
}
else{
	console.log('host local');
	app.listen(config.host.port);
	console.log("Listening on", config.host.port);
}
