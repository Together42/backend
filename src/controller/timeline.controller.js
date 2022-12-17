import * as timelineRepository from '../data/timeline.js'
import {s3} from '../s3.js'

export async function getTimelineImage(req, res) {
  const fileName = req.params.filename
  console.log(fileName)
  if(!fileName)
    return res.status(400).json({message: '조회할 이미지 파일이 없습니다'})
  try {
    const image = await timelineRepository.findByImageFileName(fileName)
    if (!image) {
      return res.status(400).json({message: '찾고자 하는 파일이 없습니다'})
    }
    const imageUrl = image.filePath
    console.log(imageUrl)
    return res.status(200).json({url: imageUrl})
  } catch (error) {
    return res.status(400).json({message: '이미지 조회 실패'})
  }
}