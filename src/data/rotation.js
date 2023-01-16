import { db } from "../db/database.js";

export async function addParticipant(participant) {
  const { intraId, attendLimit } = participant;
  return db
    .execute("INSERT INTO rotation (intraId, attendLimit) VALUES (?,?)",
      [intraId, attendLimit],
    )
    .then((result) => result[0].insertId);
}

export async function checkDuplicate(participant) {
  return db
    .execute("SELECT intraId from rotation WHERE intraId=?",
      [participant.intraId],
    )
    .then((result) => result[0]);
}