
const db = require('../../../db.js');
///*
//POST /api/together/matching
//{
//	userLIst,
//	numberTeams
//}
//*/


//[1,2,3,4,5,6]

// [[1,2], [3,4], [5,6]]

//
exports.matching = (req, res, next) => {
	//const param = [req.body.id, req.body.pw, req.body.name];
	//db.query('INSERT INTO test(`id`,`pw`,`name`) VALUES (?,?,?)', param, (err, row) =>{
	//	console.log(param);
	//	if(err)
	//		console.log(err);
	//})

	 console.log(req.body);
	console.log('matching!');
	
	res.send();
}

exports.team = (req, res, next) => {
	console.log('team');
	const param = [req.body.title, req.body.eventNum, req.body.members];
	db.query('SELECT * FROM team WHERE id=1', param, (err, result) =>{
	//console.log(req);
	console.log(result);
		if(err)
			console.log(err);
	});
	res.send();
}
