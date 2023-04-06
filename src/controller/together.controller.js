import * as togetherRepository from "../data/together.js";
import * as userRepository from "../data/auth.js";
import { publishMessage } from "./slack.controller.js";
import { config } from "../config.js";

//이벤트 생성
export async function createEvent(req, res) {
  const { title, description, categoryId } = req.body;
  const user = await userRepository.findById(req.userId);
  console.log(user);
  const createdId = user.id;
  const event = await togetherRepository.createEvent({
    title,
    description,
    createdId,
    categoryId,
  });
  let str = `:fire: 친바 공지 !! :fire:\n\n${title} 이벤트가 생성되었습니다. \nhttps://together.42jip.net/\n서둘러 참석해주세요`;
  await publishMessage(config.slack.jip, str);
  res.status(201).json({ event });
}

// 주간회의 이벤트 자동 생성
export async function createWeeklyMeetingEvent() {
  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() + 6);
  const adminUserIntraId = "tkim";
  const title = `[주간회의] ${
    meetingDate.getMonth() + 1
  }월 ${meetingDate.getDate()}일`;
  const description = `매 주 생성되는 정기 회의입니다. 해당 날짜에 회의가 없다면 ${adminUserIntraId}님이 삭제해주세요!`;
  const categoryId = 1;
  const adminUser = await userRepository.findByintraId(adminUserIntraId);
  console.log(adminUser);
  const createdId = adminUser.id;
  await togetherRepository.createEvent({
    title,
    description,
    createdId,
    categoryId,
  });
  let str = `:fire: 친바 공지 !! :fire:\n\n${title} 이벤트가 생성되었습니다. \nhttps://together.42jip.net/\n서둘러 참석해주세요`;
  await publishMessage(config.slack.jip, str);
}

//이벤트 삭제
export async function deleteEvent(req, res) {
  const id = req.params.id;
  const deleteId = await togetherRepository.findByEventId(id);
  const user = await userRepository.findById(req.userId);
  const createUser = user.id;

  if (!deleteId)
    //삭제할 친바가 없다면
    return res.status(404).json({ message: "이벤트가 없습니다" });
  //권한
  console.log(deleteId);
  if (deleteId.createdId !== createUser && !req.isAdmin)
    return res.status(401).json({ message: "권한이 없습니다" });

  await togetherRepository.deleteEvent(id);
  res.sendStatus(204);
}

//전체 이벤트 조회
export async function getEventList(req, res) {
  const EventList = await togetherRepository.getEventList();
  res.status(200).json({ EventList });
}

//이벤트 상세조회 , 유저객체정보를 배열로 넘겨달라
export async function getEvent(req, res) {
  const id = req.params.id;
  const event = await togetherRepository.findByEventId(id);
  if (!event)
    //조회할 친바가 없다면
    return res.status(404).json({ message: "이벤트가 없습니다" });
  const teamList = await getTeamList(id);

  res.status(200).json({ event, teamList });
}

//이벤트 참석
export async function register(req, res) {
  const user = await userRepository.findById(req.userId); //토큰으로 받아온 아이디
  const eventId = req.body.eventId;
  const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId);
  const matchCheck = await togetherRepository.findByEventId(eventId);

  if (matchCheck.isMatching == 1)
    //이미 매칭됐다면
    return res.status(400).json({ message: "already matching" });
  if (alreadyAttend)
    //이미 참석했다면
    return res.status(400).json({ message: "이미 참석했습니다" });
  const attend = await togetherRepository.register(user.id, eventId);
  console.log(`${user.intraId}가 ${eventId}에 참석하다`);
  res.status(201).json({ attend });
}

//이벤트 참석해제
export async function unregister(req, res) {
  const user = await userRepository.findById(req.userId); //토큰으로 받아온 아이디
  const eventId = req.params.id; //event id
  const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId);
  if (!alreadyAttend)
    //참석이 없으면
    return res.status(400).json({ message: "참석자가 없습니다" });
  //teamId가 있으면(즉 팀 매칭이 완료된경우)
  if (alreadyAttend.teamId !== null)
    return res.status(400).json({ message: "이미 매칭된 이벤트입니다" });

  await togetherRepository.unregister(user.id, eventId);
  console.log(`${user.intraId}가 ${eventId}에 참석 취소하다`);
  res.sendStatus(204);
}

async function getTeamList(id) {
  //중복되는 부분이여서 함수로빼냄
  const matchingList = await togetherRepository.getMatchingList(id);
  //teamId(키)로 객체에서 배열 그룹화
  let teamList = matchingList.reduce(function (r, a) {
    r[a.teamId] = r[a.teamId] || [];
    r[a.teamId].push(a);
    return r;
  }, Object.create(null));
  return teamList;
}

export async function getTeam(req, res) {
  const id = req.params.id; //event id
  const teamList = await getTeamList(id);
  res.status(200).json({ teamList });
}

export async function matching(req, res) {
  const { eventId, teamNum } = req.body;
  const create = await togetherRepository.findCreateUser(eventId);
  if (create.createdId !== req.userId && !req.isAdmin)
    return res.status(400).json({ message: "권한이 없습니다" });
  const eventTitle = await togetherRepository.getByEventTitle(eventId);
  const check = await togetherRepository.findAttendByEventId(eventId);
  if (check === undefined || check[0] === undefined || check[0].teamId !== null)
    //참석자가 없거나, 이미 매칭이 된경우
    return res
      .status(400)
      .json({ message: "참석자가 없거나 이미 매칭됐습니다" });
  if (check.length < teamNum)
    //유저보다 팀 개수가 많을때
    return res.status(400).json({ message: "팀 개수가 너무 많습니다" });
  if (teamNum === 0 || teamNum === "0")
    //유저보다 팀 개수가 많을때
    return res.status(400).json({ message: "팀 개수 0개 입니다" });
  shuffle(check); //팀 셔플완료  이제 팀개수대로 팀 나눠야함
  await togetherRepository.changeEvent(eventId);
  for (let i = 0; i < check.length; i++) {
    let teamId = (i % teamNum) + 1;
    await togetherRepository.createTeam(teamId, check[i].id);
  }
  const teamList = await getTeamList(eventId);
  console.log(eventTitle);
  let str = `:fire: 친바 공지 !! :fire:\n\n[${eventTitle.title}] 팀 매칭이 완료되었습니다.\n서둘러 자신의 팀원들과 연락해보세요!\nhttps://together.42jip.net/ \n :ultra_fast_parrot:\n\n`;
  for (let key in teamList) {
    const value = teamList[key];
    const test = value.map((team) => team.intraId);
    str += key;
    str += "팀 : ";
    str += test.join(", ");
    str += "\n";
  }
  console.log(`문자열 출력 ${str}`);
  await publishMessage(config.slack.ywee, str);
  res.status(201).json({ eventId, teamList });
}

export async function matchWeeklyMeetingEvent() {
  const event = await togetherRepository.getEventByCategory(1);
  if (event === undefined) return;
  const check = await togetherRepository.findAttendByEventId(event.id);
  // 참석자가 없는 경우
  if (check === undefined || check[0] === undefined) {
    await togetherRepository.deleteEvent(event.id);
    return;
  }
  // 이미 매칭된 경우
  if (check[0].teamId !== null) return;
  shuffle(check); //팀 셔플완료  이제 팀개수대로 팀 나눠야함
  await togetherRepository.changeEvent(event.id);
  const teamNum = check.length >= 3 ? 3 : 1;
  for (let i = 0; i < check.length; i++) {
    let teamId = (i % teamNum) + 1;
    await togetherRepository.createTeam(teamId, check[i].id);
  }
}

//팀 셔플
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

//게시글 작성을 위한 정보 조회 (모든 이벤트, 팀리스트)
export async function getEventInfo(req, res) {
  let eventList = await togetherRepository.getEventList();
  for (let i = 0; i < eventList.length; i++) {
    const team = await getTeamList(eventList[i].id);
    eventList[i].teamList = team;
  }
  res.status(200).json(eventList);
}

export async function getAttendingPoint(req, res) {
  const pointList = await togetherRepository.getAttendingPoint();
  res.status(200).json(pointList);
}
