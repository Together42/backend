import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import * as fs  from 'fs';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';
import boardRouter from './routes/board.js';
import { stream } from './config/winston.js';
import https from 'https';
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
app.use(cors());
app.use(morgan('combined', {stream}));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);
app.use('/api/board', boardRouter);

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
