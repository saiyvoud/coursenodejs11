import jwt from "jsonwebtoken";
import { SECREAT_KEY, SECREAT_KEY_REFRESH } from "../config/globalKey.js";
import CryptoJS from "crypto-js";
import connected from "../config/db.js";
export const CheckEmail = async (email) => {
  return new Promise(async (resovle, reject) => {
    try {
      const checkEmail = "Select * from user where email=?";
      connected.query(checkEmail, email, (err, result) => {
        if (err) reject(err);
        if (result[0]) reject("Email Already");
        resovle(true);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const GenerateToken = async (data) => {
  return new Promise(async (resovle, reject) => {
    // promise ແມ່ນຫຍັງ
    try {
      const payload = {
        id: CryptoJS.AES.encrypt(data.id, SECREAT_KEY).toString(),
      };
      const payload_refresh = {
        id: CryptoJS.AES.encrypt(data.id, SECREAT_KEY_REFRESH).toString(),
      };
      const token = jwt.sign(payload, SECREAT_KEY, { expiresIn: "2h" });
      const refreshToken = jwt.sign(payload_refresh, SECREAT_KEY_REFRESH, {
        expiresIn: "4h",
      });
      resovle({ token, refreshToken });
    } catch (error) {
      reject(error);
    }
  });
};
