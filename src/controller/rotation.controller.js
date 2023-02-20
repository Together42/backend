import * as rotationRepository from "../data/rotation.js";
import * as rotationUtils from "../utils/rotation.together.js";
import { publishMessage } from "./slack.controller.js";
import { config } from "../config.js";

export async function addParticipant(req, res) {
  let participant = req.body;
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let nextMonth = ((month + 1) % 12) + 1;
  if (nextMonth === 1) year += 1;
  try {
    const exists = await rotationRepository.getParticipantInfo({
      intraId: participant.intraId,
      month: nextMonth,
      year: year,
    });
    if (!exists.length) {
      participant["month"] = nextMonth;
      participant["year"] = year;
      if (participant.attendLimit === null) participant["attendLimit"] = [];
      await rotationRepository.addParticipant(participant);
      let rotationResult = setRotation();
      if (rotationResult.status < 0) {
        return res
          .status(500)
          .json({ message: "사서 로테이션을 실패하였습니다." });
      }
      return res
        .status(200)
        .json({
          intraId: participant.intraId,
          message: "로테이션 참석이 완료되었습니다.",
        });
    } else {
      return res
        .status(400)
        .json({
          intraId: participant.intraId,
          message: "중복되는 참석자입니다.",
        });
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
  let nextMonth = ((month + 1) % 12) + 1;
  if (nextMonth === 1) year += 1;
  try {
    const exists = await rotationRepository.getParticipantInfo({
      intraId: participant.intraId,
      month: nextMonth,
      year: year,
    });
    if (exists.length) {
      await rotationRepository.deleteParticipant({
        intraId: participant.intraId,
        month: nextMonth,
        year: year,
      });
      let rotationResult = setRotation();
      if (rotationResult.status < 0) {
        return res
          .status(500)
          .json({ message: "사서 로테이션을 실패하였습니다." });
      }
      return res
        .status(200)
        .json({
          intraId: participant.intraId,
          message: "로테이션 참석 정보를 삭제했습니다.",
        });
    } else {
      return res
        .status(400)
        .json({
          intraId: participant.intraId,
          message: "다음 달 로테이션에 참석하지 않은 사서입니다.",
        });
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
    let participants = await rotationRepository.getParticipants({
      month: month,
      year: year,
    });
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
          await rotationRepository.initAttendInfo({
            intraId: participants[i].intraId,
            month: month,
            year: year,
          });
        } catch (error) {
          console.log(error);
          return { status: -1, info: error };
        }
      }
      const rotationResult = await rotationUtils.checkAttend(
        rotationUtils.setRotation(participants, monthArrayInfo),
      );
      if (rotationResult.status === false) {
        return { status: -1, info: rotationResult.message };
      }
      for (let i = 0; i < rotationResult.monthArray.monthArray.length; i++) {
        for (
          let j = 0;
          j < rotationResult.monthArray.monthArray[i].length;
          j++
        ) {
          for (
            let k = 0;
            k < rotationResult.monthArray.monthArray[i][j].arr.length;
            k++
          ) {
            if (rotationResult.monthArray.monthArray[i][j].arr[k] != "0") {
              let day = rotationResult.monthArray.monthArray[i][j].day;
              if (day < 10) {
                day = "0" + day;
              }
              let attendDate = year + "-" + month + "-" + day + ",";
              let participantId =
                rotationResult.monthArray.monthArray[i][j].arr[k];
              try {
                await rotationRepository.setAttendDate({
                  attendDate: attendDate,
                  isSet: 1,
                  intraId: participantId,
                  month: month,
                  year: year,
                });
              } catch (error) {
                console.log(error);
                return { status: -1, info: error };
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return { status: -1, info: error };
  }
}

export async function getRotationInfo(req, res) {
  if (!Object.keys(req.query).length) {
    try {
      let rotationInfo = await rotationRepository.getRotationInfo();
      return res.status(200).json(rotationInfo);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "사서 로테이션 조회 실패" });
    }
  } else {
    try {
      let year = new Date().getFullYear();
      let month = (new Date().getMonth() % 12) + 1;
      if (month < 10) {
        month = "0" + month;
      }
      console.log(typeof req.query.month);
      if (
        Object.keys(req.query).indexOf("month") > -1 &&
        !isNaN(parseInt(req.query.month, 10))
      )
        month = req.query.month;
      if (
        Object.keys(req.query).indexOf("year") > -1 &&
        !isNaN(parseInt(req.query.year, 10))
      )
        year = req.query.year;

      let participants = await rotationRepository.getParticipants({
        month: month,
        year: year,
      });
      let participantInfo = [];
      for (let i = 0; i < participants.length; i++) {
        let date = participants[i].attendDate.split(",").slice(0, -1);
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
}

export async function updateAttendInfo(req, res) {
  let intraId = req.body.intraId;
  let before = req.body.before.trim();
  let after = req.body.after.trim();

  let year = after.split("-")[0];
  let month = after.split("-")[1];
  try {
    const participantInfo = await rotationRepository.getParticipantInfo({
      intraId: intraId,
      month: month,
      year: year,
    });
    if (participantInfo.length === 0) {
      await rotationRepository.putParticipant({
        intraId: intraId,
        attendLimit: [],
        month: month,
        year: year,
        attendDate: after + ",",
      });
      return res
        .status(200)
        .json({ intraId: intraId, message: "PUT PARTICIPATION OK" });
    }
    let attendDates = participantInfo[0].attendDate.split(",").slice(0, -1);
    let isSet = participantInfo[0].isSet;
    let newDates = [];
    if (before === "") {
      if (attendDates.indexOf(after) < 0) {
        await rotationRepository.setAttendDate({
          attendDate: after + ",",
          intraId: intraId,
          month: month,
          year: year,
          isSet: isSet,
        });
      }
    } else {
      for (let i = 0; i < attendDates.length; i++) {
        console.log("loop: ", attendDates[i], before, after, newDates);
        if (attendDates[i].trim() === before) {
          if (newDates.indexOf(after) < 0) newDates.push(after);
        } else {
          if (newDates.indexOf(attendDates[i].trim()))
            newDates.push(attendDates[i].trim());
        }
      }
      await rotationRepository.updateAttendDate({
        attendDate: newDates.join(",") + ",",
        intraId: intraId,
        month: month,
        year: year,
      });
    }
    return res
      .status(200)
      .json({ intraId: intraId, message: "UPDATE ATTEND DATE OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "일정 업데이트 실패" });
  }
}

export async function deleteAttendInfo(req, res) {
  let intraId = req.body.intraId;
  let dateDelete = req.body.date.trim();

  let year = dateDelete.split("-")[0];
  let month = dateDelete.split("-")[1];
  try {
    const participantInfo = await rotationRepository.getParticipantInfo({
      intraId: intraId,
      month: month,
      year: year,
    });
    if (participantInfo.length === 0) {
      return res
        .status(400)
        .json({
          intraId: intraId,
          month: month,
          message: "해당 달 사서 업무에 참여하지 않은 사서입니다",
        });
    }
    let attendDates = participantInfo[0].attendDate.split(",").slice(0, -1);
    let newDates = [];
    for (let i = 0; i < attendDates.length; i++) {
      if (attendDates[i].trim() != dateDelete) {
        newDates.push(attendDates[i].trim());
      }
    }
    await rotationRepository.updateAttendDate({
      attendDate: newDates.join(",") + ",",
      intraId: intraId,
      month: month,
      year: year,
    });
    return res
      .status(200)
      .json({
        intraId: intraId,
        delete: dateDelete,
        message: "DELETE ATTEND DATE OK",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "사서 일정 삭제 실패" });
  }
}

export async function postRotationMessage() {
  const getWeekNumber = (dateFrom = new Date()) => {
    let currentDate = dateFrom.getDate();
    let startOfMonth = new Date(dateFrom.setDate(1));
    let weekDay = startOfMonth.getDay();
    return Math.floor((weekDay - 1 + currentDate) / 7) + 1;
  };
  const today = new Date().getDay();

  let year = new Date().getFullYear();
  let month = (new Date().getMonth() % 12) + 1;
  let todayNum = new Date().getDate();
  const getLastDayOfMonth = new Date(year, month, -1);

  try {
    if (
      (getWeekNumber == 4 && today == 1) ||
      (getWeekNumber == 4 && today == 5)
    ) {
      let str = `마감 ${
        getLastDayOfMonth - todayNum
      }일 전! 사서 로테이션 신청 기간입니다. 친바 홈페이지에서 사서 로테이션 신청을 해주세요!`;
      await publishMessage(config.slack.jip, str);
      return "CRON JOB SUCCESS";
    }
    if (todayNum == getLastDayOfMonth) {
      let str =
        "사서 로테이션이 완료되었습니다. 친바 홈페이지에서 확인해주세요!";
      await publishMessage(config.slack.jip, str);
      return "CRON JOB SUCCESS";
    }
  } catch (error) {
    console.log(error);
    return "CRON JOB FAILED";
  }
}
