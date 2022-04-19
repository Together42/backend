import * as togetherRepository from '../data/together.js';
import * as userRepository from '../data/auth.js';

export async function createTogether(req, res) {
	const { title, description } = req.body;
	const together = await togetherRepository.createTogether({
		title,
		description,
	});
	res.status(201).json({together});
}

export async function deleteTogether(req, res){
	const id = req.params.id;
	console.log(id);
	const deleteId = await togetherRepository.findByTogetherId(id);
	if(!deleteId) //삭제할 친바가 없다면
		return res.status(404).json({message: 'Together not found'});
	await togetherRepository.deleteTogether(id);
	res.sendStatus(204);
}

export async function getTogethers(req, res){
	const togethers = await togetherRepository.getTogethers();
	res.status(200).json({togethers});
}

export async function getTogether(req, res){
	const id = req.params.id;
	const together = await togetherRepository.findByTogetherId(id);
	if(!together) //조회할 친바가 없다면
		return res.status(404).json({message: 'Together not found'});
	res.status(200).json({together});
}

export async function register(req, res){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const togetherId = req.body.togetherId;
	const alreadyAttend = await togetherRepository.findByAttend(user.id, togetherId)
	if(alreadyAttend) //이미 참석했다면
		return res.status(400).json({message: 'already attend'});
	const attend = await togetherRepository.register(user.id, togetherId);
	res.status(201).json({attend});
}

export async function unregister(req, res){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const togetherId = req.params.id;//together id
	const alreadyAttend = await togetherRepository.findByAttend(user.id, togetherId)
	if(!alreadyAttend) //참석이 없으면
		return res.status(400).json({message: 'Attend not found'});
	await togetherRepository.unregister(user.id, togetherId);
	res.sendStatus(204);
}

export async function matching(req, res) {
	const teamList = [];
	const {togetherId, teamNum } = req.body;
	const checkId = await togetherRepository.findTeamByTogetherId(togetherId);
	if(checkId)//이미 매칭을 돌렸다면
		return res.status(400).json({message: 'already matching'});

	const userId = await togetherRepository.getAttendUserId(togetherId);
	if(userId.length == 0)//참석자가 없는경우
		return res.status(400).json({message: 'Attend not found'});
	if(userId.length < teamNum) //유저보다 팀 개수가 많을때
		return res.status(400).json({message: 'Too few attendees'});

	shuffle(userId);//팀 셔플완료  이제 팀개수대로 팀 나눠야함
	for(let i = 0; i < userId.length; i++)
	{
		let teamId = i % teamNum + 1;
		await togetherRepository.createTeam(teamId, togetherId, userId[i]);
		//console.log(`id=${userId[i]}, team=${i%teamNum +1}`);
	}
	for(let i = 1; i <= teamNum; i++)
	{
		const team = await togetherRepository.getTeam(togetherId, i);
		const teamUser = team.map(factor => factor.userId);
		teamList.push({teamId:i , userList:teamUser});
	}
	res.status(201).json({togetherId:togetherId, teamList: teamList});
}

//팀 셔플
function shuffle(array){
	array.sort(()=> Math.random() - 0.5);
}