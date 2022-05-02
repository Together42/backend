import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';
import cors from 'cors';
import * as fs  from 'fs';
import https from 'https';

// express configuration
const app = express();

//const privateKey = fs.readFileSync('/etc/letsencrypt/live/42together.xyz/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/42together.xyz/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/42together.xyz/chain.pem', 'utf8');
//const credentials = {
//	key: privateKey,
//	cert: certificate,
//	ca: ca
//};


//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);


// Starting both http & https servers
//const httpsServer = https.createServer(credentials, app);

//dev
//const httpsServer = https.createServer(options, app);

//httpsServer.listen(config.host.port, () => {
//	console.log('HTTPS Server running on', config.host.port);
//});


//httpsServer.listen(443, () => {
//	console.log('HTTPS Server running on 443');
//});

app.listen(config.host.port);
console.log("Listening on", config.host.port);
