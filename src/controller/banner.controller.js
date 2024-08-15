import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db.js";
import { EMessage, SMessage } from "../service/message.js";
import {
  SendCreate,
  SendError,
  SendError400,
  SendSuccess,
} from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class BannerController {
  static async getAll(req, res) {
    try {
      const users = "Select * from banner";
      connected.query(users, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " banner", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " banner");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const uuid = req.params.uuid; // 1 body: {} 2 params ແມ່ນ string ທີ່ຈະຢູ່ກັບ url , 3 query ຄ້າຍຄືກັບ params ແຕ່ສາມາດຂຽນຂໍ້ມູນໃນ url ໄດ້
      const checkUuid = "select * from banner where bUuid=?";
      connected.query(checkUuid, uuid, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " banner", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " banner");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async insert(req, res) {
    try {
      const { title, detail } = req.body;
      const validate = await ValidateData({ title, detail });
      if (validate.length) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const file = req.files;
      if (!file) return SendError400(res, EMessage.BadRequest + " image");
      const image_url = await UploadImageToCloud(file.image.data);
      if (!image_url) return SendError(res, 400, "Error Uploadim Image");
      const insert =
        "insert into banner (bUuid,title,detail,image,createdAt,updatedAt) values (?,?,?,?,?,?)";
      const bUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(
        insert,
        [bUuid, title, detail, image_url, datetime, datetime],
        (err) => {
          if (err) return SendError(res, 400, EMessage.ErrorInsert, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async updateBanner(req, res) {
    try {
      const bUuid = req.params.bUuid;
      if (!bUuid) return SendError400(res, EMessage.BadRequest);
      const { title, detail, oldImage } = req.body;
      const validate = await ValidateData({ title, detail, oldImage });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const image = req.files;
      if (!image) return SendError400(res, EMessage.BadRequest + " image");
      const image_url = await UploadImageToCloud(image.image.data, oldImage);
      if (!image_url) return SendError400(res, EMessage.ErrorUploadImage);
      const mysql =
        "update banner set title=? , detail=? , image=? where bUuid=?";
      connected.query(mysql, [title, detail, image_url, bUuid], (err) => {
        if (err) return SendError(res, 404, EMessage.ErrorUpdate, err);
        return SendSuccess(res, SMessage.Update);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async deleteBanner(req, res) {
    try {
      const bUuid = req.params.bUuid;
      if (!bUuid) return SendError400(res, EMessage.BadRequest + "bUuid");
      const mysql = "delete  from banner where bUuid=?";
      connected.query(mysql, bUuid, (err, result) => {
        if (err) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) {
          return SendError(res, 404, EMessage.NotFound + " id");
        }
        return SendSuccess(res, SMessage.Delete);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
