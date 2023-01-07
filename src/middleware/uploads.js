import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../s3.js";

export const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(400).send({ message: "파일의 최대 크기는 50MB입니다" });
  } else {
    next();
  }
};

function isType(file) {
  return (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/gif" ||
    file.mimetype == "video/mp4" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/svg+xml" ||
    file.mimetype == "video/quicktime"
  );
}

const fileFilter = (req, file, cb) => {
  // mime type 체크하여 이미지만 필터링
  if (isType(file)) {
    req.fileValidationError = null;
    cb(null, true);
  } else {
    req.fileValidationError =
      "jpeg, jpg, png, svg, gif, mp4, mov 파일만 업로드 가능합니다.";
    cb(null, false);
  }
};

export const upload = multer(
  {
    storage: multerS3({
      s3: s3,
      bucket: "together42",
      acl: "public-read",
      key: function (req, file, cb) {
        cb(null, `uploads/${Date.now()}_${file.originalname}`);
      },
    }),
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, //50mb
    },
  },
  "NONE"
);