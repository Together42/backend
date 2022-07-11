import express from 'express';
import 'express-async-errors';
import { isAuth } from '../middleware/auth.js';
import * as boardController from '../controller/board.controller.js';
import { fileSizeLimitErrorHandler, upload} from '../middleware/uploads.js';

const router = express.Router();


//게시글 전체조회
  /**
   * @openapi
   * /api/board:
   *    get:
   *      description: 게시글 조회
   *      tags:
   *      - board
   *      responses:
   *        '200':
   *          description: 조회 결과를 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  boardList:
   *                    description: 게시글 리스트
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        boardId:
   *                          description: 게시글의 id
   *                          type: integer
   *                          example: 76
   *                        eventId:
   *                          description: 이벤트의 id
   *                          type: integer
   *                          example: 76
   *                        title:
   *                          description: 게시글 제목
   *                          type: string
   *                          example: 6회 친바 1팀 인증샷!!!
   *                        intraId:
   *                          description: 작성자 인트라 id
   *                          type: string
   *                          example: tkim
   *                        contents:
   *                          description: 내용
   *                          type: string
   *                          example: 깐부치킨 갔습니다 \n넘나 맛있는 치킨!
   *                        createdAt:
   *                          description: 생성 시간
   *                          type: date
   *                          example: 2022-07-07 04:11:31
   *                        updatedAt:
   *                          description: 수정 시간
   *                          type: date
   *                          example: 2022-07-07 04:11:31
   *                        profile:
   *                          description: 프로필
   *                          type: string
   *                          example: https://together42.github.io/frontend/c92880655d4055aafb2e2f8c8437232a.jpg
   *                        images:
   *                          description: 게시글 이미지
   *                          type: array
   *                          items:
   *                            type: object
   *                            properties:
   *                              imageId:
   *                                description: 이미지의 id
   *                                type: integer
   *                                example: 133
   *                              boardId:
   *                                description: 게시글의 id
   *                                type: integer
   *                                example: 131
   *                              filepath:
   *                                description: 게시글 path
   *                                type: string
   *                                example: https://together42.s3.ap-northeast-2.amazonaws.com/uploads/1657167091659_KakaoTalk_Photo_2022-07-07-12-40-23%20001.jpeg
   *                        attendMembers:
   *                          description: 태그인원
   *                          type: array
   *                          items:
   *                            type: object
   *                            properties:
   *                              intraId:
   *                                description: 인트라 id
   *                                type: string
   *                                example: tkim
   *                              profile:
   *                                description: 프로필
   *                                type: string
   *                                example: https://together42.github.io/frontend/c92880655d4055aafb2e2f8c8437232a.jpg
   *        '400_case1':
   *          description: 게시글이 없습니다
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { "message": "게시글이 없습니다" }
   *        '400_case2':
   *          description: 상세조회 실패
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { "message": "상세조회 실패" }
   */
router.get('/',boardController.getBoardList);

//게시글 생성
router.post('/', isAuth ,boardController.createPost);

//게시글 삭제
router.delete('/:id', isAuth ,boardController.deletePost);

//게시글 수정
router.put('/:id', isAuth ,boardController.updatePost);

//게시글 상세조회

  /**
   * @openapi
   * /api/board/{id}:
   *    get:
   *      description: 게시글 조회(상세)
   *      tags:
   *      - board
   *      parameters:
   *      - name: id
   *        in: path
   *        description: 게시글의 id
   *        schema:
   *          type: integer
   *      responses:
   *        '200':
   *          description: 조회 결과를 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  boardId:
   *                    description: 게시글의 id
   *                    type: integer
   *                    example: 131
   *                  eventId:
   *                    description: 이벤트의 id
   *                    type: integer
   *                    example: 76
   *                  title:
   *                    description: 게시글 제목
   *                    type: string
   *                    example: 6회 친바 1팀 인증샷!!!
   *                  intraId:
   *                    description: 작성자 인트라 id
   *                    type: string
   *                    example: tkim
   *                  contents:
   *                    description: 내용
   *                    type: string
   *                    example: 깐부치킨 갔습니다 \n넘나 맛있는 치킨!
   *                  createdAt:
   *                    description: 생성 시간
   *                    type: date
   *                    example: 2022-07-07 04:11:31
   *                  updatedAt:
   *                    description: 수정 시간
   *                    type: date
   *                    example: 2022-07-07 04:11:31
   *                  profile:
   *                    description: 프로필
   *                    type: string
   *                    example: https://together42.github.io/frontend/c92880655d4055aafb2e2f8c8437232a.jpg
   *                  images:
   *                    description: 게시글 이미지
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        imageId:
   *                          description: 이미지의 id
   *                          type: integer
   *                          example: 133
   *                        boardId:
   *                          description: 게시글의 id
   *                          type: integer
   *                          example: 131
   *                        filepath:
   *                          description: 게시글 path
   *                          type: string
   *                          example: https://together42.s3.ap-northeast-2.amazonaws.com/uploads/1657167091659_KakaoTalk_Photo_2022-07-07-12-40-23%20001.jpeg
   *                  attendMembers:
   *                    description: 태그인원
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        intraId:
   *                          description: 인트라 id
   *                          type: string
   *                          example: tkim
   *                        profile:
   *                          description: 프로필
   *                          type: string
   *                          example: https://together42.github.io/frontend/c92880655d4055aafb2e2f8c8437232a.jpg
   *                  comments:
   *                    description: 댓글
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 댓글 id
   *                          type: integer
   *                          example: 99
   *                        intraId:
   *                          description: 인트라 id
   *                          type: string
   *                          example: kyungsle
   *                        comments:
   *                          description: 댓글 내용
   *                          type: string
   *                          example: with 옆자리에서 치킨 먹은 현잔, 위, 경슬, 선글
   *                        updatedAt:
   *                          description: 수정 시간
   *                          type: date
   *                          example: 2022-07-07 06:36:04
   *        '400_case1':
   *          description: 게시글이 없습니다
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { "message": "게시글이 없습니다" }
   *        '400_case2':
   *          description: 상세조회 실패
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { "message": "상세조회 실패" }
   */
router.get('/:id',boardController.getBoardDetail);

//댓글 생성
router.post('/comment', isAuth, boardController.createComment);

//댓글 수정
router.put('/comment/:id', isAuth, boardController.updateComment);

//댓글 삭제
router.delete('/comment/:id', isAuth, boardController.deleteComment);

//사진 업로드
router.post('/upload', upload.array("image",8), fileSizeLimitErrorHandler, boardController.upload);

//사진 삭제
router.delete('/image/remove/:id', boardController.deleteImage);

export default router;