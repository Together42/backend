import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {} from "express-async-errors";
import * as userRepository from "../data/auth.js";
import { config, smtpTransport } from "../config.js";
import urlencoded from "urlencode";

const generateRandom = function (min, max) {
  const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum.toString();
};

export async function cert(req, res) {
  const CEA = req.body.CEA;
  const hashNum = urlencoded.decode(req.cookies.hashNum);
  const compare = await bcrypt.compare(CEA, hashNum);

  try {
    if (compare) {
      res.status(200).send({ result: "success" });
    } else {
      res.status(400).send({ result: "fail" });
    }
  } catch (err) {
    res.status(400).send({ result: "fail" });
    console.error(err);
  }
}

export async function mailAuthentication(req, res) {
  //이메일 보내기
  const { sendEmail } = req.body;
  console.log(sendEmail);

  let number = generateRandom(111111, 999999);
  const hashNum = await bcrypt.hash(number, config.bcrypt.saltRounds);
  console.log(hashNum);
  res.cookie("hashNum", hashNum.toString(), {
    maxAge: 300000,
    domain: ".together42.github.io",
  });

  const mailOptions = {
    from: config.naver.id,
    to: sendEmail,
    subject: "[친바]인증 관련 이메일 입니다.",
    text: "인증번호는 " + number + " 입니다.",
    html:
      "<div style='font-family: 'Apple SD Gothic Neo', 'sans-serif' !important; width: 540px; height: 600px; border-top: 4px solid #348fe2; margin: 100px auto; padding: 30px 0; box-sizing: border-box;'>" +
      "<h1 style='margin: 0; padding: 0 5px; font-size: 28px; font-weight: 400;'>" +
      "<span style='font-size: 15px; margin: 0 0 10px 3px;'>Together42</span><br />" +
      "<span style='color: #348fe2;'>인증번호</span> 안내입니다." +
      "</h1>" +
      "<p style='font-size: 16px; line-height: 26px; margin-top: 50px; padding: 0 5px;'>" +
      "안녕하세요.<br />" +
      "요청하신 인증번호가 생성되었습니다.<br />" +
      "감사합니다." +
      "</p>" +
      "<p style='font-size: 16px; margin: 40px 5px 20px; line-height: 28px;'>" +
      "인증번호: <br />" +
      "<span style='font-size: 24px;'>" +
      number +
      "</span>" +
      "</p>" +
      "<div style='border-top: 1px solid #DDD; padding: 5px;'>" +
      "</div>" +
      "</div>",
  };
  await smtpTransport.sendMail(mailOptions, (err, res) => {
    // 메일을 보내는 코드
    if (err) {
      console.log(err);
      res.status(400).json({ data: "err" });
    }
    smtpTransport.close();
  });
  res.status(200).send({ data: "success" });
}

export async function signUp(req, res) {
  const { intraId, password, email, profile } = req.body;
  const user = await userRepository.findByintraId(intraId);
  console.log(user);
  if (user) {
    //이미 존재하는 사용자라면
    return res.status(400).json({ message: `${intraId}는 이미 사용중입니다` });
  }

  const checkEmail = await userRepository.findByEmail(email);
  if (checkEmail) {
    //이미 존재하는 이메일
    return res.status(400).json({ message: `${email}는 이 사용중입니다` });
  }
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const userId = await userRepository.createUser({
    intraId,
    password: hashed,
    email,
    profile,
  });
  const token = createJwtToken(userId, 0); //가입 후 isAdmin 디폴트값은 0
  console.log(`signUp: ${intraId},  time : ${new Date()}`);
  res.status(201).json({ token, intraId });
}

export async function login(req, res) {
  const { intraId, password } = req.body;
  const user = await userRepository.findByintraId(intraId);
  if (!user) {
    //사용자가 존재하는지 검사
    return res.status(401).json({ message: "아이디와 비밀번호가 틀렸습니다" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    //비밀먼호 검증
    return res.status(401).json({ message: "아이디와 비밀번호가 틀렸습니다" });
  }
  const profile = user.profile;
  const token = createJwtToken(user.intraId, user.isAdmin);
  console.log(`login id : ${intraId},  time : ${new Date()}`);
  res.status(200).json({ token, intraId, profile });
}

function createJwtToken(id, isAdmin) {
  return jwt.sign({ id, isAdmin }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

export async function me(req, res) {
  const user = await userRepository.findById(req.userId);
  if (!user) {
    return res.status(404).json({ mesage: "사용자가 없습니다" });
  }
  res.status(200).json({ token: req.token, intraId: user.intraId });
}

export async function getByUserList(req, res) {
  const userList = await userRepository.getByUserList();
  if (!userList) {
    return res.status(404).json({ mesage: "사용자가 없습니다" });
  }
  res.status(200).json({ userList: userList });
}

export async function getByUserInfo(req, res) {
  const intraId = req.params.id;
  const userInfo = await userRepository.findByintraId(intraId);
  if (!userInfo) return res.status(400).json({ message: "사용자가 없습니다." });
  res.status(200).json(userInfo);
}

export async function updatePassword(req, res) {
  const id = req.params.id;
  const { intraId, password } = req.body;
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const updated = await userRepository.updatePassword({
    id: id,
    intraId: intraId,
    password: hashed,
  });
  res.status(200).json({ updated });
}
