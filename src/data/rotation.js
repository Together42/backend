import { db } from "../db/database.js";

export async function getAttendableUsers() {
  try {
    return db
      .execute("SELECT * FROM users WHERE canAttend='1'", 
      )
      .then((result) => result[0]);
  } catch (error) {
    throw error;
  }
}

export async function addParticipant(participant) {
  const { intraId, attendLimit, month, year } = participant;
  return db
    .execute("INSERT INTO rotation (intraId, attendLimit, month, year, isSet) VALUES (?,?,?,?,?)",
      [intraId, attendLimit, month, year, 0],
    )
    .then((result) => result[0].insertId);
}

export async function putParticipant(participant) {
  const { intraId, attendLimit, month, year, attendDate } = participant;
  return db
    .execute("INSERT INTO rotation (intraId, attendLimit, month, year, attendDate, isSet) VALUES (?,?,?,?,?,?)",
      [intraId, attendLimit, month, year, attendDate, 0],
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
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet FROM rotation WHERE (month=? AND year=?)",
      [dateInfo.month, dateInfo.year],
    )
    .then((result) => result[0]);
}

export async function getRotationInfo() {
  return db
    .execute("SELECT * FROM rotation")
    .then((result) => result[0]);
}

export async function getParticipantInfo(participantInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (intraId=? AND month=? AND year=?)",
      [participantInfo.intraId, participantInfo.month, participantInfo.year],
    )
    .then((result) => result[0]);
}

export async function getParticipantInfoAll(participantInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (intraId=?)", [participantInfo.intraId],
    )
    .then((result) => result[0]);
}

export async function getParticipantInfoAllMonth(participantInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (intraId=? AND month=?)",
      [participantInfo.intraId, participantInfo.month],
    )
    .then((result) => result[0]);
}

export async function getParticipantInfoAllYear(participantInfo) {
  return db
    .execute("SELECT id, intraId, attendLimit, attendDate, isSet from rotation WHERE (intraId=? AND year=?)",
      [participantInfo.intraId, participantInfo.year],
    )
    .then((result) => result[0]);
}

export async function setAttendDate(attendInfo) {
  return db
    .execute("UPDATE rotation SET attendDate=CONCAT(IFNULL(attendDate, ''),?),isSet=? WHERE (intraId=? AND month=? AND year=?)",
      [attendInfo.attendDate, attendInfo.isSet, attendInfo.intraId, attendInfo.month, attendInfo.year],
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

export async function addHolidayInfo(holidayInfo) {
  const { year, month, day, info } = holidayInfo;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM holiday_info WHERE year = ? AND month = ? AND day = ?", 
      [year, month, day],
    );
    if (rows.length === 0) {
      return db
        .execute("INSERT INTO holiday_info (month, year, day, info) VALUES (?,?,?,?)",
        [month, year, day, info],
        )
        .then((result) => result[0]);
    } else {
      console.log('Record already exists');
    }
  } catch (error) {
    throw error;
  }
}

export async function getHolidayByMonth(holidayInfo) {
  const { year, month } = holidayInfo;
  try {
    return db
      .execute("SELECT * FROM holiday_info WHERE year = ? AND month = ?", 
      [year, month],
      )
      .then((result) => result[0]);
  } catch (error) {
    throw error;
  }
}

export async function getLibariansByDate(date) {
  console.log(date);
  try {
    return db
      .execute(
        "SELECT users.intraId, users.slackId, rotation.attendDate \
        FROM users, rotation \
        WHERE users.intraId = rotation.intraId and rotation.attendDate LIKE ?",
        [`%${date}%`],
      )
      .then((result) => result[0]);
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getMonthlyLibarians(year, month) {
  try {
    return db
      .execute(
        "SELECT users.intraId, users.slackId, rotation.attendDate \
        FROM users, rotation \
        WHERE users.intraId = rotation.intraId and year = ? and month = ?",
        [year, month],
      )
      .then((result) => result[0]);
  } catch (error) {
    console.log(error);
    return [];
  }
}