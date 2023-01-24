function sortByArray(array) {
  array.sort((a, b) => b.attendLimit.length - a.attendLimit.length);
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function isEmptyObj(object) {
  return JSON.stringify(object) === "{}";
}

export function initMonthArray() {
  let year = new Date().getFullYear();
  const month = new Date().getMonth();
  const nextMonth = (month + 1) % 12 + 1;
  if (nextMonth === 1)
    year += 1;
  const daysOfMonth = new Date(year, nextMonth, 0).getDate();
  const tmpMonthArray = [];
  
  let tmpWeek = [];

  for (let i = 1; i <= daysOfMonth; i++) {
    let tmpDayObject = {};
    let tmp = [];
    if (new Date(year, nextMonth - 1, i).getDay() > 0 &&
      new Date(year, nextMonth - 1, i).getDay() < 6) {
      let day = new Date(year, nextMonth - 1, i).getDate();
      tmp.push(0);
      tmp.push(0);
      tmpDayObject = {day: day, arr: tmp};
      if (i === daysOfMonth)
        tmpMonthArray.push(tmpWeek);
    }
    else {
      tmpMonthArray.push(tmpWeek);
      tmpDayObject = {};
      tmpWeek = [];
    }
    if (!isEmptyObj(tmpDayObject)) {
      tmpWeek.push(tmpDayObject);
    }
  }
  const result = tmpMonthArray.filter(arrlen => arrlen.length > 0);
  return ({monthArray: result, nextMonth: nextMonth, year: year});
}

export function setRotation(attendance, monthArrayInfo) {
  let canDuplicate = false;
  if (attendance.length < 10) canDuplicate = true;
  let participation = 0;
  let participants = [];
  for (let i = 0; i < attendance.length; i++) {
    participants.push({id: attendance[i].id, intraId: attendance[i].intraId,
      attendLimit: attendance[i].attendLimit, attend: 0});
  }
  shuffle(participants);
  sortByArray(participants);
  let checkContinue = false;
  let continueIndex = 0;
  let isLooped = false;
  let isLoopedAgain = false;
  for (let i = 0; i < monthArrayInfo.monthArray.length; i++) {
    for (let j = 0; j < monthArrayInfo.monthArray[i].length; j++) {
      let participant1 = undefined;
      let arrIndex = 0;
      for (let k = 0; k < participants.length; k++) {
        if (checkContinue === true) {
          k += continueIndex;
          checkContinue = false;
        }
        // console.log("first :", participants[k].userId, participants[k].attend, k)
        if (participants[k].attend < participation) {
          if (participants[k].attendLimit
            .indexOf(monthArrayInfo.monthArray[i][j].day) == -1) {
            if (monthArrayInfo.monthArray[i][j].arr
              .indexOf(participants[k].intraId) == -1) {
              participant1 = participants[k];
              participant1.attend += 1;
              break;
            }
          }
        } else {
          if (canDuplicate && (participants[k].attend == participation)) {
            //console.log("Duplication occours!")
            if (participants[k].attendLimit
              .indexOf(monthArrayInfo.monthArray[i][j].day) == -1) {
              if (monthArrayInfo.monthArray[i][j].arr
                .indexOf(participants[k].intraId) == -1) {
                participant1 = participants[k];
                participant1.attend += 1;
                break;
              }
            }
          }
        }
      }
      if (participant1 === undefined) {
        participation += 1;
        if (j > 0) {
          j -= 1;
        } else {
          j = -1;
        }
        if (isLooped === false) {
          isLooped = true;
        } else if (isLooped === true) {
          isLooped = false;
          j += 1;
        }
        continue;
      } else {
        continueIndex = 0;
        checkContinue = false;
        isLooped = false;
        monthArrayInfo.monthArray[i][j].arr[arrIndex++] = participant1.intraId;
      }
      // console.log("first: ", monthArrayInfo.monthArray[i][j], participation, i, j)

      // 한 번 더 반복
      let participant2 = undefined;
      for (let k = 0; k < participants.length; k++) {
        // console.log("second :", participants[k].userId, participants[k].attend, k)
        if (participants[k].attend < participation) {
          if (participants[k].attendLimit
            .indexOf(monthArrayInfo.monthArray[i][j].day) == -1) {
            if (monthArrayInfo.monthArray[i][j].arr
              .indexOf(participants[k].intraId) == -1) {
              participant2 = participants[k];
              participant2.attend += 1;
              break;
            }
          }
        } else {
          if (canDuplicate && (participants[k].attend <= participation + 1)) {
            //console.log("Duplication occours!")
            if (participants[k].attendLimit
              .indexOf(monthArrayInfo.monthArray[i][j].day) == -1) {
              if (monthArrayInfo.monthArray[i][j].arr
                .indexOf(participants[k].intraId) == -1) {
                participant2 = participants[k];
                participant2.attend += 1;
                break;
              }
            }
          }
        }
      }
      if (participant2 === undefined) {
        participation += 1;
        if (j > 0) {
          j -= 1;
        } else {
          j = -1;
        }
        if (participant1 && isLooped === false) {
          if (isLoopedAgain === true) {
            isLoopedAgain = false;
            continue;
          }
          let index = participants.findIndex(obj => obj.intraId === participant1.intraId);
          continueIndex = index;
          checkContinue = true;
          isLooped = true;
          isLoopedAgain = true;
          participant1.attend -= 1;
          monthArrayInfo.monthArray[i][j + 1].arr[0] = 0;
        } else if (isLooped === true) {
          isLooped = false;
          isLoopedAgain = false;
          j += 1;
        }
        continue;
      } else {
        continueIndex = 0;
        checkContinue = false;
        isLooped = false;
        monthArrayInfo.monthArray[i][j].arr[arrIndex++] = participant2.intraId;
      }
      // console.log("second: ", monthArrayInfo.monthArray[i][j], participation, i, j)
    }
  }
  // for (let i = 0; i < monthArrayInfo.monthArray.length; i++) {
  //   for (let j = 0; j < monthArrayInfo.monthArray[i].length; j++) {
  //     console.log(monthArrayInfo.monthArray[i][j]);
  //   }
  // }
  return ({monthArray: monthArrayInfo, participants: participants});
}

export function checkAttend(attendInfo) {
  let loop = 1;
  let flag = true;
  while (loop) {
    flag = true;
    if (loop > 100) {
      break;
    }
    for (let i = 0; i < attendInfo.participants.length; i++) {
      if (attendInfo.participants[i].attend === 0) flag = false;
    }
    if (flag === true)
      break;
    loop++;
  }
  if (flag === false)
    return ({status: flag, loop: loop, message: "적합한 매칭을 만들지 못했습니다."});
  else
    return ({status: flag, loop: loop, ...attendInfo});
}