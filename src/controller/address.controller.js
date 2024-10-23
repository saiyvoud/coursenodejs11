import connected from "../config/db.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendError400, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class AddressController {
  static async getAll(req, res) {
    try {
      const category = "Select * from address";
      connected.query(category, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " address", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " address");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const uuid = req.params.aUuid;
      const checkUuid = "select * from address where aUuid=?";
      connected.query(checkUuid, uuid, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " address", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " address");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getByUser(req, res) {
    try {
      const user_id = req.params.user_id;
      const checkUuid = "select * from address where user_id=?";
      connected.query(checkUuid, user_id, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " userID", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " userID");
        return SendSuccess(res, SMessage.SelectOne, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async insert(req, res) {
    try {
        const userID = req.user;
      const { village, district, province, detail, lat, lng } =
        req.body;
      const validate = await ValidateData({
        village,
        district,
        province,
        detail,
        lat,
        lng,
    
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const aUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const insert = `insert into address (aUuid,village,district,province,detail,lat,lng,user_id,
        createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`;
      connected.query(
        insert,
        [
          aUuid,
          village,
          district,
          province,
          detail,
          lat,
          lng,
          userID,
          datetime,
          datetime,
        ],
        (err) => {
          if (err) return SendError400(res, EMessage.ErrorInsert, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async updateAddress(req, res) {
    try {

      const aUuid = req.params.aUuid;
      const user_id = req.user;
      const { village, district, province, detail, lat, lng} =
        req.body;
      const validate = await ValidateData({
        village,
        district,
        province,
        detail,
        lat,
        lng,
      
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }

      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const insert = `update address set village=?,district=?,province=?,detail=?,lat=?,lng=?,user_id=?,
        updatedAt=? where aUuid=? `;
      connected.query(
        insert,
        [
          village,
          district,
          province,
          detail,
          lat,
          lng,
          user_id,
          datetime,
          aUuid,
        ],
        (err) => {
          if (err) return SendError400(res, EMessage.ErrorUpdate, err);
          return SendCreate(res, SMessage.Update);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async deleteAddress(req, res) {
    try {
      const aUuid = req.params.aUuid;
      if (!aUuid) return SendError400(res, EMessage.BadRequest + "aUuid");
      const checkBanner = "select * from address where aUuid=?";
      connected.query(checkBanner, aUuid, (error, result) => {
        if (error) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + " id");
        const mysql = "delete from address where aUuid=?";
        connected.query(mysql, aUuid, (err) => {
          if (err) return SendError400(res, EMessage.NotFound, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
