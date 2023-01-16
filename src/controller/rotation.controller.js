import * as rotationRepository from "../data/rotation.js";

export async function addParticipant(req, res) {
  const participant = req.body;
  try {
    const exists = await rotationRepository.checkDuplicate(participant);
    if (!exists.length) {
      await rotationRepository.addParticipant(participant);
      return res.status(200).json({ message: "OK" });
    }
    else
      return res.status(500).json({ message: "중복되는 참석자입니다." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "참석자 입력 실패."});
  }
}