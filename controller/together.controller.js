import * as togetherRepository from '../data/together.js';
import * as userRepository from '../data/auth.js';

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

export async function createTogether(req, res, next) {
	const { title, description } = req.body;
	const together = await togetherRepository.createTogether({
		title,
		description,
	});
	//console.log(together);
	res.status(201).json({together});
}

export async function deleteTogether(req, res, next){
	const id = req.params.id;
	console.log(id);
	const deleteId = await togetherRepository.findByTogetherId(id);
	if(!deleteId) //삭제할 친바가 없다면
		return res.sendStatus(404);
	
	await togetherRepository.deleteTogether(id);
	res.sendStatus(204);
}

export async function getTogethers(req, res, next){
	const togethers = await togetherRepository.getTogethers();
	res.status(200).json({togethers});
}

export async function getTogether(req, res, next){
	const id = req.params.id;
	const togetherId = await togetherRepository.findByTogetherId(id);
	if(!togetherId) //조회할 친바가 없다면
		return res.sendStatus(404);
	
	const together = await togetherRepository.getTogether(id);
	res.status(200).json({together});
}

export async function register(req, res, next){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const togetherId = req.body.togetherId;
	const alreadyAttend = await togetherRepository.findByAttend(user.id, togetherId)
	//console.log(alreadyAttend);
	if(alreadyAttend) //이미 참석했다면
		return res.sendStatus(400);
	const attend = await togetherRepository.register(user.id, togetherId);
	res.status(201).json({attend});
}

export async function unregister(req, res, next){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const togetherId = req.params.id;//together id
	const alreadyAttend = await togetherRepository.findByAttend(user.id, togetherId)
	//console.log(alreadyAttend);
	if(!alreadyAttend) //참석이 없으면
		return res.sendStatus(400);
	await togetherRepository.unregister(user.id, togetherId);
	res.sendStatus(204);
}