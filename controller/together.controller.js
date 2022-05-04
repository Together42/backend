import * as togetherRepository from '../data/together.js';
import * as userRepository from '../data/auth.js';

export async function createEvent(req, res) {
	const { title, description } = req.body;
	const user = await userRepository.findById(req.userId);
	console.log(user);
	const createdBy = user.id;
	const event = await togetherRepository.createEvent({
		title,
		description,
		createdBy,
	});
	res.status(201).json({event});
}

export async function deleteEvent(req, res){
	const id = req.params.id;
	const deleteId = await togetherRepository.findByEventId(id);
	const user = await userRepository.findById(req.userId);
	const createUser = user.id;

	if(!deleteId) //삭제할 친바가 없다면
		return res.status(404).json({message: 'Event not found'});
	
		//권한
	if(deleteId.createdBy !== createUser)
		return res.status(401).json({message: 'UnAuthorization User'});

	await togetherRepository.deleteEvent(id);
	res.sendStatus(204);
}

export async function getEventList(req, res){
	const EventList = await togetherRepository.getEventList();
	res.status(200).json({EventList});
}

//상세조회 , 유저객체정보를 배열로 넘겨달라
export async function getEvent(req, res){
	const id = req.params.id;
	const event = await togetherRepository.findByEventId(id);
	if(!event) //조회할 친바가 없다면
		return res.status(404).json({message: 'Event not found'});
	const teamList = await getTeamList(id);

	res.status(200).json({event, teamList});
}

export async function register(req, res){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const eventId = req.body.eventId;
	const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId)
	if(alreadyAttend) //이미 참석했다면
		return res.status(400).json({message: 'already attend'});
	const attend = await togetherRepository.register(user.id, eventId);
	res.status(201).json({attend});
}

export async function unregister(req, res){
	const user = await userRepository.findById(req.userId);//토큰으로 받아온 아이디
	const eventId = req.params.id;//event id
	const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId)
	if(!alreadyAttend) //참석이 없으면
		return res.status(400).json({message: 'Attend not found'});
	//teamId가 있으면(즉 팀 매칭이 완료된경우)
	if(alreadyAttend.teamId !== null)
		return res.status(400).json({message: 'already matching'});

	await togetherRepository.unregister(user.id, eventId);
	res.sendStatus(204);
}

async function getTeamList(id) //중복되는 부분이여서 함수로빼냄
{
	const matchingList = await togetherRepository.getMatchingList(id);
	//teamId(키)로 객체에서 배열 그룹화
	let teamList = matchingList.reduce(function (r, a) {
        r[a.teamId] = r[a.teamId] || [];
        r[a.teamId].push(a);
        return r;
    }, Object.create(null));
	return teamList;
}

export async function getTeam(req, res){
	const id = req.params.id;//event id
	const teamList = await getTeamList(id);
	res.status(200).json({teamList});
}

export async function matching(req, res) {
	const {eventId, teamNum } = req.body;
	const create = await togetherRepository.findCreateUser(eventId);
	if(create.createdBy !== req.userId)
		return res.status(400).json({message: 'UnAuthorization User'});
	const check = await togetherRepository.findAttendByEventId(eventId)
	if(check === undefined || check[0] === undefined || check[0].teamId !== null) //참석자가 없거나, 이미 매칭이 된경우
		return res.status(400).json({message: 'already matching or not exists'});

	if(check.length < teamNum) //유저보다 팀 개수가 많을때
		return res.status(400).json({message: 'Too few attendees'});
	shuffle(check);//팀 셔플완료  이제 팀개수대로 팀 나눠야함
	await togetherRepository.chagneEvent(eventId);
	for(let i = 0; i < check.length; i++)
	{
		let teamId = i % teamNum + 1;
		await togetherRepository.createTeam(teamId, check[i].id);
	}

	res.status(201).json(await getTeamList(eventId));
}

//팀 셔플
function shuffle(array){
	array.sort(()=> Math.random() - 0.5);
}