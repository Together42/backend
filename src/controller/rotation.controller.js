import * as rotationRepository from "../data/rotation.js";

export async function addParticipant(req, res) {
  const participant = req.body;
  console.log(participant);
  try {
    const result = await rotationRepository.addParticipant(participant);
    console.log(result);
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "참석자 입력 실패"});
  }
}