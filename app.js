const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require("path");
const port = 3000;
const indexRouter = require('./routes/render/index');
require('dotenv').config();

// express configuration
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//parse JSON and url-encoded query
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//print the request log on console
app.use(morgan('dev'));

//set the secret key variable for jwt
app.set('jwt-secret', process.env.JW_SECRET);
app.set('port', port);
app.use('/', indexRouter);

//configure api router
app.use('/api', require('./routes/api'));

app.listen(app.get("port"));
console.log("Listening on", app.get("port"));