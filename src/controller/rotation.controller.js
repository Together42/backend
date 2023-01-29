import * as rotationRepository from "../data/rotation.js";
import * as rotationUtils from "../utils/rotation.together.js";

export async function addParticipant(req, res) {
  let participant = req.body;
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let nextMonth = (month + 1) % 12 + 1;
  if (nextMonth === 1)
    year += 1;
  try {
    const exists = await rotationRepository.getParticipantInfo({ intraId: participant.intraId, month: nextMonth, year: year });
    if (!exists.length) {
      participant["month"] = nextMonth;
      participant["year"] = year;
      await rotationRepository.addParticipant(participant);
      let rotationResult = setRotation();
      if (rotationResult.status < 0) {
        return res.status(500).json({ message: "로테이션 참석은 완료되었지만, 사서 로테이션을 실패하였습니다." });
      }
      return res.status(200).json({ intraId: participant.intraId, message: "로테이션 참석이 완료되었습니다." });
    } else {
      return res.status(400).json({ intraId: participant.intraId, message: "중복되는 참석자입니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "참석자 추가 실패." });
  } 
}

export async function deleteParticipant(req, res) {
  let participant = req.body;
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let nextMonth = (month + 1) % 12 + 1;
  if (nextMonth === 1)
    year += 1;
  try {
    const exists = await rotationRepository.getParticipantInfo({ intraId: participant.intraId, month: nextMonth, year: year });
    if (exists.length) {
      await rotationRepository.deleteParticipant({ intraId: participant.intraId, month: nextMonth, year: year });
      let rotationResult = setRotation();
      if (rotationResult.status < 0) {
        return res.status(500).json({ message: "로테이션 참석 삭제는 완료되었지만, 사서 로테이션을 실패하였습니다." });
      }
      return res.status(200).json({ intraId: participant.intraId, message: "로테이션 참석 정보를 삭제했습니다." });
    } else {
      return res.status(400).json({ intraId: participant.intraId, message: "다음 달 로테이션에 참석하지 않은 사서입니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "참석자 삭제 실패." });
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
              let attendDate = year + "-" + month + "-" + day + ",";
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
  let before = req.body.before.trim();
  let after = req.body.after.trim();
  try {
    const participantInfo = await rotationRepository.getParticipantInfo({ intraId: intraId, month: month, year: year });
    console.log(participantInfo);
    if (participantInfo.length === 0) {
      await rotationRepository.putParticipant({ intraId: intraId, attendLimit: null, month: month, year: year, attendDate : after + "," });
      return res.status(200).json({ intraId: intraId, message: "PUT PARTICIPATION OK" });
    }
    let attendDates = participantInfo[0].attendDate.split(",").slice(0,-1);
    let newDates = [];
    if (before === "") {
      if (attendDates.indexOf(after) < 0){
        await rotationRepository.setAttendDate({ attendDate: after + ",", intraId: intraId, month: month, year: year });
      }
    } else {
      for (let i = 0; i < attendDates.length; i++) {
        if (attendDates[i].trim() === before) {
          newDates.push(after);
        } else {
          newDates.push(attendDates[i].trim());
        }
      }
      await rotationRepository.updateAttendDate({ attendDate: newDates.join(",") + ",", intraId: intraId, month: month, year: year});
    }
    return res.status(200).json({ intraId: intraId, message: "UPDATE ATTEND DATE OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "일정 업데이트 실패" });
  }
}

export async function deleteAttendInfo(req, res) {
  let year = new Date().getFullYear();
  let month = (new Date().getMonth()) % 12 + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let intraId = req.body.intraId;
  let dateDelete = req.body.date.trim();
  try {
    const participantInfo = await rotationRepository.getParticipantInfo({ intraId: intraId, month: month, year: year });
    if (participantInfo === undefined) {
      return res.status(400).json({ intraId: intraId, message: "해당 달 사서 업무에 참여하지 않은 사서입니다" });
    }
    let attendDates = participantInfo[0].attendDate.split(",").slice(0,-1);
    let newDates = [];
    for (let i = 0; i < attendDates.length; i++) {
      if (attendDates[i].trim() != dateDelete) {
        newDates.push(attendDates[i].trim());
      }
    }
    await rotationRepository.updateAttendDate({ attendDate: newDates.join(",") + ",", intraId: intraId, month: month, year: year});
    return res.status(200).json({ intraId: intraId, message: "DELETE ATTEND DATE OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "사서 일정 추가 실패" });
  }
}