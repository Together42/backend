import * as userRepository from '../data/user.js'

export async function getUserList(req, res) {
  const userList = await userRepository.getUserList()
  if (!userList) {
    return res.status(404).json({ message: '사용자가 없습니다' })
  }
  res.status(200).json({ userList: userList })
}