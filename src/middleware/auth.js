import jwt from "jsonwebtoken";
import * as userRepository from "../data/auth.js";
import { config } from "../config.js";

const AUTH_ERROR = { message: "Authetication Error" };

//모든 요청에 대해서 헤더에 auth 있는지
export const isAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    return res.status(401).json(AUTH_ERROR);
  }

  const token = authHeader.split(" ")[1];

  //추후 수정해야함
  jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }
    const user = await userRepository.findByintraId(decoded.id);
    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }
    req.userId = user.id; //req.customdData
    req.isAdmin = user.isAdmin;
    next();
  });
};
