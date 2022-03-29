
const db = require('../../../db.js');
///*
//POST /api/together/matching
//{
//	userLIst,
//	numberTeams
//}
//*/


exports.Matching = (req, res, next) => {
	const param = [req.body.id, req.body.pw, req.body.name];
	db.query('INSERT INTO test(`id`,`pw`,`name`) VALUES (?,?,?)', param, (err, row) =>{
		console.log(param);
		if(err)
			console.log(err);
	})
	res.end();
}
