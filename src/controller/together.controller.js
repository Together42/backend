import * as togetherRepository from '../data/together.js'
import * as userRepository from '../data/auth.js'
import * as togetherUtils from '../utils/rotation.together.js'
import { publishMessage } from './slack.controller.js'
import { config } from '../config.js'

//이벤트 생성
export async function createEvent(req, res) {
  const { title, description } = req.body
  const user = await userRepository.findById(req.userId)
  console.log(user)
  const createdId = user.id
  const event = await togetherRepository.createEvent({
    title,
    description,
    createdId,
  })
  let str = `:fire: 친바 공지 !! :fire:\n\n${title} 이벤트가 생성되었습니다. \nhttps://together42.github.io/frontend/\n서둘러 참석해주세요`
  await publishMessage(config.slack.jip, str)
  res.status(201).json({ event })
}

//이벤트 삭제
export async function deleteEvent(req, res) {
  const id = req.params.id
  const deleteId = await togetherRepository.findByEventId(id)
  const user = await userRepository.findById(req.userId)
  const createUser = user.id

  if (!deleteId) //삭제할 친바가 없다면
    return res.status(404).json({ message: '이벤트가 없습니다' })
  //권한
  console.log(deleteId)
  if (deleteId.createdId !== createUser && !req.isAdmin)
    return res.status(401).json({ message: '권한이 없습니다' })

  await togetherRepository.deleteEvent(id)
  res.sendStatus(204)
}

//전체 이벤트 조회
export async function getEventList(req, res) {
  const EventList = await togetherRepository.getEventList()
  res.status(200).json({ EventList })
}

//이벤트 상세조회 , 유저객체정보를 배열로 넘겨달라
export async function getEvent(req, res) {
  const id = req.params.id
  const event = await togetherRepository.findByEventId(id)
  if (!event) //조회할 친바가 없다면
    return res.status(404).json({ message: '이벤트가 없습니다' })
  const teamList = await getTeamList(id)

  res.status(200).json({ event, teamList })
}

//이벤트 참석
export async function register(req, res) {
  const user = await userRepository.findById(req.userId)//토큰으로 받아온 아이디
  const eventId = req.body.eventId
  const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId)
  const matchCheck = await togetherRepository.findByEventId(eventId)

  if (matchCheck.isMatching == 1) //이미 매칭됐다면
    return res.status(400).json({ message: 'already matching' })
  if (alreadyAttend) //이미 참석했다면
    return res.status(400).json({ message: '이미 참석했습니다' })
  const attend = await togetherRepository.register(user.id, eventId)
  console.log(`${user.intraId}가 ${eventId}에 참석하다`)
  res.status(201).json({ attend })
}
//이벤트 참석해제
export async function unregister(req, res) {
  const user = await userRepository.findById(req.userId)//토큰으로 받아온 아이디
  const eventId = req.params.id//event id
  const alreadyAttend = await togetherRepository.findByAttend(user.id, eventId)
  if (!alreadyAttend) //참석이 없으면
    return res.status(400).json({ message: '참석자가 없습니다' })
  //teamId가 있으면(즉 팀 매칭이 완료된경우)
  if (alreadyAttend.teamId !== null)
    return res.status(400).json({ message: '이미 매칭된 이벤트입니다' })

  await togetherRepository.unregister(user.id, eventId)
  console.log(`${user.intraId}가 ${eventId}에 참석 취소하다`)
  res.sendStatus(204)
}

async function getTeamList(id) //중복되는 부분이여서 함수로빼냄
{
  const matchingList = await togetherRepository.getMatchingList(id)
  //teamId(키)로 객체에서 배열 그룹화
  let teamList = matchingList.reduce(function (r, a) {
    r[ a.teamId ] = r[ a.teamId ] || []
    r[ a.teamId ].push(a)
    return r
  }, Object.create(null))
  return teamList
}

export async function getTeam(req, res) {
  const id = req.params.id//event id
  const teamList = await getTeamList(id)
  res.status(200).json({ teamList })
}

export async function matching(req, res) {
  const { eventId, teamNum } = req.body
  const create = await togetherRepository.findCreateUser(eventId)
  
  // 약간 임시의 느낌이 들지만... 하나의 기능에서 모두 동작하기 위해
  // 제가 아래의 제목으로 생성한 이벤트만 특수한 결과를 반환하도록 설정하였습니다.
  if (create.title === '다음 달 사서 로테이션 신청') {
    if (create.createdId !== 70) // 70 = gychoi
      return res.status(400).json({ message: '권한이 없습니다' })
    const eventTitle = create.title // 위 create에 모든 정보가 포함되어 있어서, 아래처럼 쿼리를 따로 추가하지 않아도 이벤트 제목을 알 수 있을 듯 합니다. 차후 리팩토링 고려...
    const check = await togetherRepository.findAttendByEventId(eventId)
    if (check === undefined || check[ 0 ] === undefined || check[ 0 ].teamId !== null)
      return res.status(400).json({ message: '참석자가 없거나 이미 매칭됐습니다' })

    // 로테이션에서 팀 개수는 고려하지 않음. teamNum과 관련된 조건은 모두 패스.
    // rotationInfo : 로테이션 정보를 담은 객체. 참가자들이 각 주에 배치된 배열과, 참가자 명단(rotation), 그리고 다음 달(nextMonth)을 반환함. {rotationInfo: rotation, nextMonth: nextMonth}
    const rotationInfo = await togetherUtils.rotationEvent(eventId)
    await togetherRepository.chagneEvent(eventId)
    let str = `[[테스트입니다!!]]\n\n :fire: 친바 공지 !! :fire:\n\n[${rotationInfo.nextMonth}월 사서 로테이션] 매칭이 완료되었습니다! 총 ${rotationInfo.rotation.participants.length} 명이 참여해주셨어요. 감사합니다!\nhttps://together42.github.io/frontend/ \n :ultra_fast_parrot:\n\n`
    let teamList = {}
    let userArray
    for (let i = 0; i < rotationInfo.rotation.monthArray.length; i++) {
      let week = i + 1
      str += `${week}주차 : `
      userArray = await togetherUtils.getParticipantsInfo(week, rotationInfo.rotation.monthArray[i])
      teamList[String(week)] = userArray
      for (let j = 0; j < userArray.length; j++) {
        str += userArray[j].intraId
        if (j < userArray.length - 1)
          str += ', '
      }
      str += '\n'
    }
    //console.log(teamList)
    console.log(str)
    await publishMessage(config.slack.jip, str)
    return res.status(201).json({ eventId, teamList })
  }

  if (create.createdId !== req.userId && !req.isAdmin) // isadmin이 필요한 이유?!
    return res.status(400).json({ message: '권한이 없습니다' })
  const eventTitle = await togetherRepository.getByEventTitle(eventId)
  const check = await togetherRepository.findAttendByEventId(eventId)
  if (check === undefined || check[ 0 ] === undefined || check[ 0 ].teamId !== null)//참석자가 없거나, 이미 매칭이 된경우
    return res.status(400).json({ message: '참석자가 없거나 이미 매칭됐습니다' })
  if (check.length < teamNum) //유저보다 팀 개수가 많을때
    return res.status(400).json({ message: '팀 개수가 너무 많습니다' })
  if (teamNum === 0 || teamNum === '0') //유저보다 팀 개수가 많을때
    return res.status(400).json({ message: '팀 개수 0개 입니다' })
  shuffle(check)//팀 셔플완료  이제 팀개수대로 팀 나눠야함
  await togetherRepository.chagneEvent(eventId)
  for (let i = 0; i < check.length; i++) {
    let teamId = i % teamNum + 1
    await togetherRepository.createTeam(teamId, check[ i ].id)
  }
  const teamList = await getTeamList(eventId)
  console.log(eventTitle)
  let str = `:fire: 친바 공지 !! :fire:\n\n[${eventTitle.title}] 팀 매칭이 완료되었습니다.\n서둘러 자신의 팀원들과 연락해보세요!\nhttps://together42.github.io/frontend/ \n :ultra_fast_parrot:\n\n`
  for (let key in teamList) {
    const value = teamList[ key ]
    const test = value.map(team => team.intraId)
    str += key
    str += '팀 : '
    str += test.join(', ')
    str += '\n'
  }
  console.log(`문자열 출력 ${str}`)
  await publishMessage(config.slack.jip, str)
  res.status(201).json({ eventId, teamList })
}

//팀 셔플
function shuffle(array) {
  array.sort(() => Math.random() - 0.5)
}

//게시글 작성을 위한 정보 조회 (모든 이벤트, 팀리스트)
export async function getEventInfo(req, res) {
  let eventList = await togetherRepository.getEventList()
  for (let i = 0; i < eventList.length; i++) {
    const team = await getTeamList(eventList[ i ].id)
    eventList[ i ].teamList = team
  }
  res.status(200).json(eventList)
}
