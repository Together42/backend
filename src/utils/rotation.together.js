import * as togetherRepository from '../data/together.js'
import * as userRepository from '../data/user.js'

function initMonthArray() {
  let year = new Date().getFullYear()
  const month = new Date().getMonth()
  const nextMonth = (month + 1) % 12 + 1
  if (nextMonth === 1)
    year += 1
  const monthDays = new Date(year, nextMonth, 0).getDate() // 다음 달 마지막 일을 보여줌
  // const firstDay =  new Date(year, nextMonth - 1, 1).getDay() // 필요한 값은 아님...
  // console.log(`year: ${year}, next month: ${nextMonth},\nnext month days: ${monthDays}, first day of next month: ${firstDay}\n`)
  const tmpMonthArray = [] // 이차원 배열
  let tmp = []
  // 주중 요일만을 담은 배열을 만듬.
  for (let i = 1; i <= monthDays; i++) {
    if (new Date(year, nextMonth - 1, i).getDay() > 0 &&
      new Date(year, nextMonth - 1, i).getDay() < 6) {
      tmp.push(0)
      tmp.push(0)
      if (i === monthDays)
        tmpMonthArray.push(tmp)
    }
    else {
      tmpMonthArray.push(tmp)
      tmp = []
    }
  }
  const result = tmpMonthArray.filter(arrlen => arrlen.length > 0)
  return ({monthArray: result, nextMonth: nextMonth})
}

//팀 셔플
function shuffle(array) {
  array.sort(() => Math.random() - 0.5)
}

async function setAttendance(attendance, monthArray) {
  //console.log(attendance, monthArray, weekdays)
  let canDuplicate = false
  if (attendance.length < 10)
    canDuplicate = true
  let participation = 1
  let participants = []
  // 참가자 id와 참여 횟수를 담은 새로운 객체 생성
  for (let idx = 0; idx < attendance.length; idx++) {
    participants.push({id: attendance[idx].id, userId: attendance[idx].userId, attend: 0})
  }
  shuffle(participants)
  // 이차원 배열을 돌면서, participants 객체를 훑으며,
  // 한 주에 겹치는 유저가 없도록 배열에 유저를 추가함.
  // 동시에 공평하게 참가를 시키기 위해, 모두 비슷한 참여 횟수로 배치함.
  // 만약 참가자가 10명 이하일 경우, 반드시 한 주에 중복되는 참가자가 발생할 수밖에 없음.
  for (let i = 0; i < monthArray.length; i++) {
    for (let j = 0; j < monthArray[i].length; j++) {
      let participant = undefined
      for (let k = 0; k < participants.length; k++) {
        if (participants[k].attend < participation) {
          if (monthArray[i].indexOf(participants[k].userId) < 0)
          {
            participant = participants[k]
            participant.attend += 1
            break
          }
        } else {
          if (participants[k].attend === participation && canDuplicate) {
            console.log('duplication occurs!')
            participant = participants[k]
            participant.attend += 1
            break
          }
        }
      }
      // 만약 모든 참가자가 한 번씩 참가하였다면, 필참 횟수 기준을 1 높임.
      if (participant === undefined) {
        participation += 1
        if (!canDuplicate)
          j -= 1
      } else {
        monthArray[i][j] = participant.userId
        await togetherRepository.createTeam(i + 1, participant.id) // DB 내 Team은 본인이 근무하는 가장 마지막 주차가 됩니다. 칼럼 설정 상 주차를 여러 개 포함할 수가 없어서...
        participant = undefined
      }
    }
    shuffle(participants)
  }
  // console.log(monthArray, participants)
  return ({monthArray: monthArray, participants: participants})
}

export async function rotationEvent(eventId) {
  const attendance = await togetherRepository.findAttendByEventId(eventId)
  const monthArrayInfo = initMonthArray()
  const rotationInfo = await setAttendance(attendance, monthArrayInfo.monthArray)
  return ({rotation: rotationInfo, nextMonth: monthArrayInfo.nextMonth})
}

export async function getParticipantsInfo(week, weekday) {
  let userArray = []
  let user = undefined
  for (let i = 0; i < weekday.length; i++) {
    let userObject = {}
    user = await userRepository.findUserById(weekday[i])
    userObject['intraId'] = user.intraId
    userObject['profile'] = user.profile
    userObject['teamId'] = week
    userArray.push(userObject)
  }
  return (userArray)
}