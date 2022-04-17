
///*
//POST /api/together/matching
//{
//	userLIst,
//	numberTeams
//}
//*/

export async function team(req, res, next) {
	console.log(req.body);
	
	
	console.log('test');
	const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }

	console.log(obj); // { title: 'product' }
	

	res.status(201).json({test:req.body});
}
