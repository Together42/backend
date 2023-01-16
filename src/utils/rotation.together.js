import * as togetherRepository from "../data/together.js";
import * as userRepository from "../data/user.js";

// 반환 값:
// monthArray : 다음 달의 주차 별 평일을 담은 이차원 배열.
// 평일 당 두 명의 사서가 들어가기 때문에, 각 주차 당 10개의 요소가 들어간다.
// ex) 첫 번쨰 주차는 평일이 5일이고, 마지막 주차는 평일이 3일인 경우
// [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ... [0, 0, 0, 0, 0, 0]]
// nextMonth : 다음 달이 몇월인지 나타낸다.
function initMonthArray() {
  let year = new Date().getFullYear();
  const month = new Date().getMonth();
  const nextMonth = ((month + 1) % 12) + 1;
  if (nextMonth === 1) year += 1;
  const monthDays = new Date(year, nextMonth, 0).getDate();
  const tmpMonthArray = [];
  let tmp = [];
  for (let i = 1; i <= monthDays; i++) {
    if (
      new Date(year, nextMonth - 1, i).getDay() > 0 &&
      new Date(year, nextMonth - 1, i).getDay() < 6
    ) {
      tmp.push(0);
      tmp.push(0);
      if (i === monthDays) tmpMonthArray.push(tmp);
    } else {
      tmpMonthArray.push(tmp);
      tmp = [];
    }
  }
  const result = tmpMonthArray.filter((arrlen) => arrlen.length > 0);
  return { monthArray: result, nextMonth: nextMonth };
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// 반환 값:
// monthArray : 주차 별 사서들이 담긴 이차원 배열.
// participant : 이번 달 로테이션에 참여하는 사서의 정보.
async function setAttendance(attendance, monthArray) {
  let canDuplicate = false;
  if (attendance.length < 10) canDuplicate = true;
  let participation = 1;
  let participants = [];
  for (let idx = 0; idx < attendance.length; idx++) {
    participants.push({
      id: attendance[idx].id,
      userId: attendance[idx].userId,
      attend: 0,
    });
  }
  shuffle(participants);
  for (let i = 0; i < monthArray.length; i++) {
    for (let j = 0; j < monthArray[i].length; j++) {
      let participant = undefined;
      for (let k = 0; k < participants.length; k++) {
        if (participants[k].attend < participation) {
          if (monthArray[i].indexOf(participants[k].userId) < 0) {
            participant = participants[k];
            participant.attend += 1;
            break;
          }
        } else {
          if (participants[k].attend === participation && canDuplicate) {
            console.log("duplication occurs!");
            participant = participants[k];
            participant.attend += 1;
            break;
          }
        }
      }
      if (participant === undefined) {
        participation += 1;
        if (!canDuplicate) j -= 1;
      } else {
        monthArray[i][j] = participant.userId;
        // DB 내 Team은 본인이 근무하는 가장 마지막 주차가 됩니다.
        // 칼럼 설정 상 주차를 여러 개 포함할 수가 없어서...
        await togetherRepository.createTeam(i + 1, participant.id);
        participant = undefined;
      }
    }
    shuffle(participants);
  }
  return { monthArray: monthArray, participants: participants };
}

export async function rotationEvent(eventId) {
  const attendance = await togetherRepository.findAttendByEventId(eventId);
  const monthArrayInfo = initMonthArray();
  const rotationInfo = await setAttendance(
    attendance,
    monthArrayInfo.monthArray,
  );
  return ({rotation: rotationInfo, nextMonth: monthArrayInfo.nextMonth});
}

export async function getParticipantsInfo(week, weekday) {
  let userArray = [];
  let user = undefined;
  for (let i = 0; i < weekday.length; i++) {
    let userObject = {};
    user = await userRepository.findUserById(weekday[i]);
    userObject["intraId"] = user.intraId;
    userObject["profile"] = user.profile;
    userObject["teamId"] = week;
    userArray.push(userObject);
  }
  return userArray;
}