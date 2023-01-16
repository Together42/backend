import * as timelineRepository from "../data/timeline.js";

export async function listAllImages(req, res) {
  try {
    const images = await timelineRepository.listAllImages();
    if (!images) {
      return res.status(400).json({ message: "이미지 조회 실패" });
    }
    const imageUrl = images.map((item) => {
      return {
        url: item.filePath,
      };
    });
    return res.status(200).json({ img: imageUrl });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "이미지 조회 실패" });
  }
}

export async function upload(req, res) {
  const boardId = 38;
  const image = req.files;
  const path = image.map((img) => img.location);
  if (req.fileValidationError) {
    //파일이 크거나 형식이 다를때
    return res.status(400).send({ message: req.fileValidationError });
  }
  if (image.length < 1) {
    //이미지가 없을때
    return res.status(400).send(util.fail(400, "이미지가 없습니다"));
  }
  const imageId = await timelineRepository.imageUpload(boardId, image);
  if (imageId.errno)
    return res.status(400).send({ message: "잘못된 boardId입니다" });
  return res
    .status(200)
    .send(
      util.success(200, "업로드를 완료했습니다", {
        imageId: imageId,
        path: path,
      }),
    );
}

const util = {
  success: (status, message, data) => {
    return {
      status: status,
      success: true,
      message: message,
      data: data,
    };
  },
  fail: (status, message) => {
    return {
      status: status,
      success: false,
      message: message,
    };
  },
};