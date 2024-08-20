import connected from "../config/db.js";
import { EMessage, SMessage } from "../service/message.js";
import {
  SendError,
  SendSuccess,
  SendCreate,
  SendError400,
} from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import {v4 as uuidv4} from "uuid";
export default class CategoryController {
  static async getAll(req, res) {
    try {
      const category = "Select * from category";
      connected.query(category, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " category", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " category");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const uuid = req.params.cUuid;
      const checkUuid = "select * from category where cUuid=?";
      connected.query(checkUuid, uuid, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " category", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " category");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async insert(req, res) {
    try {
      const { title } = req.body;
      const validate = await ValidateData({ title });
      if (validate.length) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const insert =
        "insert into category (cUuid,title,createdAt,updatedAt) values (?,?,?,?)";
      const cUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      connected.query(insert, [cUuid, title, datetime, datetime], (err) => {
        if (err) return SendError(res, 400, EMessage.ErrorInsert, err);
        return SendCreate(res, SMessage.Insert);
      });
    } catch (error) {
        console.log(error);
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async updateCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      if (!cUuid) return SendError400(res, EMessage.BadRequest);
      const { title } = req.body;
      const validate = await ValidateData({ title });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const mysql = "update category set title=? ,updatedAt=? where cUuid=?";
      connected.query(mysql, [title, datetime, cUuid], (err) => {
        if (err) return SendError(res, 404, EMessage.ErrorUpdate, err);
        return SendSuccess(res, SMessage.Update);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async deleteCategory(req, res) {
    try {
      const cUuid = req.params.cUuid;
      if (!cUuid) return SendError400(res, EMessage.BadRequest + "cUuid");
      const checkBanner = "select * from category where cUuid=?";
      connected.query(checkBanner, cUuid, (error, result) => {
        if (error) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + " id");
        const mysql = "delete from category where cUuid=?";
        connected.query(mysql, cUuid, (err) => {
          if (err) return SendError400(res, EMessage.NotFound, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
