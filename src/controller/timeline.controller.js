import * as timelineRepository from '../data/timeline.js'

export async function listAllImages(req, res) {
  try {
    const images = await timelineRepository.listAllImages()
    if (!images) {
      return res.status(400).json({message: '이미지 조회 실패'})
    }
    const imageUrl = images.map(item => {
      return {
        url: item.filePath,
      }
    })
    return res.status(200).json({img: imageUrl})
  } catch (error) {
    console.log(error)
    return res.status(400).json({message: '이미지 조회 실패'})
  }
}