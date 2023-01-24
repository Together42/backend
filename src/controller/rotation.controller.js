import * as rotationRepository from "../data/rotation.js";
import * as rotationUtils from "../utils/rotation.together.js";

export async function addParticipant(req, res) {
  let participant = req.body;
  try {
    const exists = await rotationRepository.checkDuplicate(participant);
    if (!exists.length) {
      let year = new Date().getFullYear();
      const month = new Date().getMonth();
      const nextMonth = (month + 1) % 12 + 1;
      if (nextMonth === 1)
        year += 1;
      participant["month"] = nextMonth;
      participant["year"] = year;
      console.log(participant);
      await rotationRepository.addParticipant(participant);
      let rotationResult = setRotation();
      if (rotationResult.status < 0) {
        return res.status(500).json({ message: "사서 로테이션 실패" });
      } else {
        return res.status(200).json({ message: "로테이션 참석이 완료되었습니다." });
      }
    }
    else
      return res.status(500).json({ message: "중복되는 참석자입니다." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "참석자 입력 실패." });
  } 
}

async function setRotation() {
  const monthArrayInfo = rotationUtils.initMonthArray();
  let month = monthArrayInfo.nextMonth;
  if (month < 10) {
    month = "0" + month;
  }
  let year = monthArrayInfo.year;
  try {
    let participants = await rotationRepository.getParticipants({ month: month, year: year });
    let allAttend = true;
    for (let i = 0; i < participants.length; i++) {
      if (participants[i].isSet === 0) {
        allAttend = false;
      }
    }
    if (allAttend === true) {
      console.log("Up to date");
    } else {
      for (let i = 0; i < participants.length; i++) {
        try {
          await rotationRepository.initAttendInfo({ intraId: participants[i].intraId, month: month, year: year });
        } catch (error) {
          console.log(error);
          return ({ status: -1, info: error });
        }
      }
      const rotationResult = rotationUtils.checkAttend(rotationUtils.setRotation(participants, monthArrayInfo));
      if (rotationResult.status === false) {
        return ({ status: -1, info: rotationResult.message });
      }
      for (let i = 0; i < rotationResult.monthArray.monthArray.length; i++) {
        for (let j = 0; j < rotationResult.monthArray.monthArray[i].length; j++) {
          for (let k = 0; k < rotationResult.monthArray.monthArray[i][j].arr.length; k++) {
            if (rotationResult.monthArray.monthArray[i][j].arr[k] != "0") {
              let day = rotationResult.monthArray.monthArray[i][j].day;
              if (day < 10) {
                day = "0" + day;
              }
              let attendDate = year + "-" + month + "-" + day + ", ";
              let participantId = rotationResult.monthArray.monthArray[i][j].arr[k];
              try {
                await rotationRepository.setAttendDate({ attendDate: attendDate, intraId: participantId, month: month, year: year });
              } catch (error) {
                console.log(error);
                return ({ status: -1, info: error });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return ({ status: -1, info: error });
  }
}

export async function getRotationInfo(req, res) {
  let year = new Date().getFullYear();
  let month = (new Date().getMonth()) % 12 + 1;
  if (month < 10) {
    month = "0" + month;
  }
  try {
    let participants = await rotationRepository.getParticipants({ month: month, year: year });
    let participantInfo = [];
    for (let i = 0; i < participants.length; i++) {
      let date = participants[i].attendDate.split(",").slice(0,-1);
      let participantId = participants[i].intraId;
      participantInfo.push({ date: date, intraId: participantId });
    }
    console.log(participantInfo);
    return res.status(200).json(participantInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "사서 로테이션 조회 실패" });
  }
}

export async function updateAttendInfo(req, res) {
  let year = new Date().getFullYear();
  let month = (new Date().getMonth()) % 12 + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let intraId = req.body.intraId;
  let before = req.body.before;
  let after = req.body.after;
  try {
    const participantInfo = await rotationRepository.getParticipantInfo({ intraId: intraId, month: month, year: year });
    let attendDates = participantInfo[0].attendDate.split(",").slice(0,-1);
    let newDates = [];
    for (let i = 0; i < attendDates.length; i++) {
      if (attendDates[i] === before) {
        newDates.push(after);
      } else {
        newDates.push(attendDates[i]);
      }
    }
    await rotationRepository.updateAttendDate({ attendDate: newDates.toString() + ", ", intraId: intraId, month: month, year: year});
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "일정 업데이트 실패" });
  }
}