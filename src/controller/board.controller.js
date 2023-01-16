import * as boardRepository from "../data/board.js";
import * as userRepository from "../data/user.js";
import { publishMessage } from "./slack.controller.js";
import { s3 } from "../s3.js";
//게시글 생성
export async function createPost(req, res) {
  const { title, contents, eventId, attendMembers } = req.body;
  console.log(attendMembers);
  const writerId = req.userId;

  const check = await boardRepository.checkAttendMember(attendMembers); //참석유저검증
  if (check.length !== attendMembers.length)
    return res.status(400).json({ message: "없는 유저입니다" });
  if (title == "")
    return res.status(400).json({ message: "제목을 넣어주세요" });
  const post = await boardRepository.createPost({
    writerId,
    title,
    contents,
    eventId,
  });
  let str = `:fire: 친바 공지 !! :fire:\n\n${title} 게시글이 생성되었습니다.\nhttps://together42.github.io/frontend/`;

  //check.map(async (member)=>{//슬랙봇 메시지 보내기
  //  if(member.slackId)
  //    await publishMessage(member.slackId, str)
  //})
  console.log(post);

  await boardRepository.createAttendMember(attendMembers, post);
  res.status(201).json({ post });
}

//게시글 삭제
export async function deletePost(req, res) {
  const id = req.params.id;
  const deleteId = await boardRepository.findByPostId(id);
  console.log(deleteId);

  if (!deleteId)
    //삭제할 글이 없다면
    return res.status(404).json({ message: "삭제할 게시글이 없습니다" });
  if (deleteId.writerId !== req.userId && !req.isAdmin)
    //권한
    return res.status(401).json({ message: "권한이 없습니다" });
  const imageId = await boardRepository.getImages(id);
  console.log(imageId);
  imageId.map((image) => {
    deleteObjectOfS3(image.fileKey);
  });
  await boardRepository.deletePost(id);
  res.sendStatus(204);
}

//게시글 수정
//일단 제목, 내용만 수정가능, / 사진은 추후에
export async function updatePost(req, res) {
  const id = req.params.id;
  const { title, contents, eventId, attendMembers } = req.body;
  //제목이 없을시 에러
  if (title == "")
    return res.status(400).json({ message: "제목을 넣어주세요" });

  const updateId = await boardRepository.findByPostId(id);
  if (!updateId) {
    //해당 게시글이 없다면
    return res.status(404).json({ message: "게시글이 없습니다" });
  }
  if (updateId.writerId !== req.userId && !req.isAdmin) {
    return res.status(401).json({ message: "권한이 없습니다" });
  }
  const updated = await boardRepository.updatePost({
    id,
    title,
    contents,
    eventId,
    attendMembers,
  });
  res.status(200).json({ updated });
}

export async function getBoardList(req, res) {
  const eventId = req.query.eventId;
  let boardList;
  console.log(`eventId = ${eventId}`);
  try {
    const list = await boardRepository.getBoardList(eventId);
    boardList = await Promise.all(
      list.map(async (board) => {
        const imageList = await boardRepository.getImages(board.boardId);
        board.images = imageList;
        return board;
      }),
    );
  } catch (error) {
    return res.status(400).json({ message: "게시판 조회 실패" });
  }
  res.status(200).json({ boardList });
}

export async function getBoardDetail(req, res) {
  const boardId = req.params.id;
  const board = await boardRepository.getBoard(boardId);
  if (!board) return res.status(400).json({ message: "게시글이 없습니다" });
  try {
    const attendMembers = await boardRepository.getAttendMembers(boardId);
    const comments = await boardRepository.getComments(boardId);
    const image = await boardRepository.getImages(boardId);
    board.images = image;
    board.attendMembers = attendMembers;
    board.comments = comments;
  } catch (error) {
    return res.status(400).json({ message: "상세조회 실패" });
  }
  console.log(board);

  res.status(200).json(board);
}

//comment

export async function createComment(req, res) {
  const { boardId, comment } = req.body;
  const writerId = req.userId;
  console.log(
    `boardId = ${boardId}, comment = ${comment}, writerId = ${writerId}`,
  );
  const result = await boardRepository.createComment(
    boardId,
    comment,
    writerId,
  );
  // 게시글에 댓글이 달리면 슬랙 메세지를 보낸다.
  const matchedPost = await boardRepository.findByPostId(boardId);
  const writerInfo = await userRepository.findUserById(matchedPost.writerId);
  if (writerInfo.slackId) {
    let str = `${matchedPost.title} 게시글에 댓글이 달렸습니다.\nhttps://together42.github.io/frontend/review`;
    await publishMessage(writerInfo.slackId, str);
  } else {
    console.log("board.controller.js : Slack 댓글 알림 메세지 보내기 실패.");
  }
  res.status(200).json({ result });
}

export async function updateComment(req, res) {
  const id = req.params.id;
  const comment = req.body.comment;
  const writerId = req.userId;
  console.log(`comment = ${comment}, writerId = ${writerId}`);
  const commentId = await boardRepository.findByCommentId(id);
  if (writerId !== commentId.writerId)
    return res.status(401).json({ message: "권한이 없습니다" });

  const comments = await boardRepository.updateComment(comment, id);
  console.log(comments);
  res.status(200).json({ comments });
}

export async function deleteComment(req, res) {
  const id = req.params.id;
  const deleteId = await boardRepository.findByCommentId(id);
  console.log(deleteId);

  if (!deleteId)
    //삭제할 댓글이 없다면
    return res.status(404).json({ message: "삭제할 댓글이 없습니다" });
  if (deleteId.writerId !== req.userId && !req.isAdmin)
    //권한
    return res.status(401).json({ message: "권한이 없습니다" });

  await boardRepository.deleteComment(id);
  res.sendStatus(204);
}

//파일 업로드

export async function upload(req, res, err) {
  const boardId = req.body.boardId;
  const image = req.files;
  console.log(
    `image length = ${image.length}, fileValidationError = ${req.fileValidationError}`,
  );
  console.log(image[0]);
  const path = image.map((img) => img.location);
  if (req.fileValidationError) {
    //파일이 크거나 형식이 다를때
    return res.status(400).send({ message: req.fileValidationError });
  }
  if (image.length < 1) {
    //이미지가 없을때
    return res.status(400).send(util.fail(400, "이미지가 없습니다"));
  }
  const imageId = await boardRepository.imageUpload(boardId, image);
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

export async function deleteImage(req, res) {
  const id = req.params.id;
  const deleteId = await boardRepository.findByImageId(id);
  console.log(deleteId);

  if (!deleteId)
    //삭제할 이미지가 없다면
    return res.status(404).json({ message: "삭제할 사진이 없습니다" });
  try {
    deleteObjectOfS3(deleteId.fileKey); //s3에서 이미지 삭제
    await boardRepository.deleteImage(id); //db에서 지우는 작업
    res.sendStatus(204);
  } catch (e) {
    console.log(e);
  }
}

function deleteObjectOfS3(fileKey) {
  s3.deleteObject(
    {
      //s3에서 삭제
      Bucket: "together42",
      Key: fileKey,
    },
    function (err, data) {
      if (err) console.log(err);
      console.log(data);
    },
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
