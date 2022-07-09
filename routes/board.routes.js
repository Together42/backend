import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import 'express-async-errors';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import { isAuth } from '../middleware/auth.js';
import * as boardController from '../controller/board.controller.js';
import { s3 } from '../s3.js';

const router = express.Router();

const fileSizeLimitErrorHandler = (err, req, res, next) => {
	if (err) {
		res.status(400).send({message: "파일의 최대 크기는 50MB입니다"});
	} else {
		next()
	}
}

function isType(file)
{
	return (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'|| 
	file.mimetype == 'image/gif' || file.mimetype == 'video/mp4' || 
	file.mimetype == 'image/jpg' || file.mimetype == 'image/svg+xml' || 
	file.mimetype == 'video/quicktime')
}

const fileFilter = (req, file, cb) => {
    // mime type 체크하여 이미지만 필터링
    if (isType(file)) {
        req.fileValidationError = null;
		cb(null, true);
    } else {
		req.fileValidationError = "jpeg, jpg, png, svg, gif, mp4, mov 파일만 업로드 가능합니다.";
        cb(null, false);
    }
}

const upload = multer({ 
	storage: multerS3({
		s3: s3,
		bucket: 'together42',
		acl: 'public-read',
		key: function(req, file, cb){
			cb(null, `uploads/${Date.now()}_${file.originalname}`);
		}
	}),
	fileFilter:fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024 //50mb
	}

},'NONE');

//게시글 전체조회
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
   * /api/books/info/{id}:
   *    get:
   *      description: 책 한 종류의 정보를 가져온다.
   *      tags:
   *      - books
   *      parameters:
   *      - name: id
   *        in: path
   *        description: 책의 id
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
   *                  id:
   *                    description: 책의 id
   *                    type: integer
   *                    example: 4261
   *                  title:
   *                    description: 제목
   *                    type: string
   *                    example: 12가지 인생의 법칙
   *                  author:
   *                    description: 저자
   *                    type: string
   *                    example: 조던 B. 피터슨
   *                  publisher:
   *                    description: 출판사
   *                    type: string
   *                    example: 메이븐
   *                  image:
   *                    description: 이미지 주소
   *                    type: string
   *                    example: https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F3943658%3Ftimestamp%3D20210706194852
   *                  category:
   *                    description: 카테고리
   *                    type: string
   *                    example: 프로그래밍
   *                  publishedAt:
   *                    description: 출판일자
   *                    type: string
   *                    example: 2018년 10월
   *                  isbn:
   *                    descriptoin: isbn
   *                    type: string
   *                    example: '9791196067694'
   *                  books:
   *                    description: 비치된 책들
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 실물 책의 id
   *                          type: integer
   *                          example: 3
   *                        callSign:
   *                          description: 청구기호
   *                          type: string
   *                          example: h1.18.v1.c1
   *                        donator:
   *                          description: 책의 기부자
   *                          type: string
   *                          example: seongyle
   *                        dueDate:
   *                          description: 반납 예정 일자, 대출가능 시 '-'
   *                          type: date
   *                          example: 21.08.05
   *                        isLendable:
   *                          description: 책의 대출가능여부
   *                          type: boolean
   *                          example: 1
   *        '400_case1':
   *          description: id가 숫자가 아니다.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
   *        '400_case2':
   *          description: 유효하지않은 infoId 값.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 304 }
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