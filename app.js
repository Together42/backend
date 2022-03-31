const express = require("express");
const db = require("./db.js");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require("path");
const router = express.Router();
const port = 3000;
const indexRouter = require('./routes/render/index');
const authCheck = require('./routes/middleware/token');
require('dotenv').config();

// express configuration
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//print the request log on console
app.use(morgan('dev'));

//set the secret key variable for jwt
app.set('jwt-secret', process.env.JW_SECRET);

app.set('port', port);

app.use(authCheck);
app.use('/', indexRouter);

//configure api router
app.use('/api', require('./routes/api'));










//db exam
//app.get("/",(req, res) => {
//	db.query(`select * from test`, (err, results) =>{
//		if(err)
//			console.log(err);
//		res.send(results);
//	});
//});

//app.route("/book")
//	.get((req, res) => {
//		res.send('Get a random book')
//	})
//	.post((req, res) => {
//		res.send('Add a book');
//	})

//app.get("/post",(req, res) => {
//	const sql = `insert into board(title, content) values("tkim","smart boy")`; 
//	db.query(sql,req.body, (err, results) =>{
//		if(err)
//			console.log(err);
//		console.log(results);
//		res.send(results);
//	});
//});


app.listen(app.get("port"));
console.log("Listening on", app.get("port"));