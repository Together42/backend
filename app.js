import express from 'express';
import morgan from 'morgan';
//const path = require("path");
import path from 'path';
import indexRouter from './routes/render/index.js';
//const indexRouter = require('./api/routes/render/index');
import { config } from './config.js';
import authRouter from './routes/auth.js';
import togetherRouter from './routes/together.js';

// express configuration
const app = express();
const __dirname = path.resolve();
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//print the request log on console
app.use(morgan('dev'));

//set the secret key variable for jwt
app.use('/', indexRouter);

app.use('/api/auth', authRouter);
app.use('/api/together', togetherRouter);


app.listen(config.host.port);
console.log("Listening on", config.host.port);