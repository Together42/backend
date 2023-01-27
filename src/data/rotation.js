import { db } from "../db/database.js";

export async function addParticipant(participant) {
  const { intraId, attendLimit, month, year } = participant;
  return db
    .execute("INSERT INTO rotation (intraId, attendLimit, month, year, isSet) VALUES (?,?,?,?,?)",
      [intraId, attendLimit, month, year,0],
    )
    .then((result) => result[0].insertId);
}

export async function deleteParticipant(participantInfo) {
  return db
    .execute("DELETE FROM rotation WHERE (intraId=? AND month=? AND year=?)",
      [participantInfo.intraId, participantInfo.month, participantInfo.year],
    )
    .then((result) => result[0]);
}

export async function getParticipants(dateInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (month=? AND year=?)",
      [dateInfo.month, dateInfo.year],
    )
    .then((result) => result[0]);
}

export async function getParticipantInfo(participantInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (intraId=? AND month=? AND year=?)",
      [participantInfo.intraId, participantInfo.month, participantInfo.year],
    )
    .then((result) => result[0]);
}

export async function setAttendDate(attendInfo) {
  return db
    .execute("UPDATE rotation SET attendDate=CONCAT(IFNULL(attendDate, ''),?),isSet=? WHERE (intraId=? AND month=? AND year=?)",
      [attendInfo.attendDate, 1, attendInfo.intraId, attendInfo.month, attendInfo.year],
    )
    .then((result) => result[0]);
}

export async function initAttendInfo(attendInfo) {
  return db
    .execute("UPDATE rotation SET attendDate='',isSet=? WHERE (intraId=? AND month=? and year=?)",
      [0, attendInfo.intraId, attendInfo.month, attendInfo.year],
    )
    .then((result) => result[0]);
}

export async function updateAttendDate(attendInfo) {
  return db
    .execute("UPDATE rotation SET attendDate=? WHERE (intraId=? AND month=? and year=?)",
      [attendInfo.attendDate, attendInfo.intraId, attendInfo.month, attendInfo.year],
    )
    .then((result) => result[0]);
}
