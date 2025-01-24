import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db.js";
import { EMessage, SMessage, StatusOrder } from "../service/message.js";
import { SendError, SendError400, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import { FindOneOrder,FindOneUser } from "../service/service.js";
export default class OrderController {
  static async getAll(req, res) {
    try {
      const order = "Select * from tb_order";
      connected.query(order, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " order");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const uuid = req.params.oUuid;
      const checkUuid = "select * from tb_order where oUuid=?";
      connected.query(checkUuid, uuid, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " order");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getBy(req, res) {
    try {
      const uuid = req.params.userID;
      const checkUuid = "select * from tb_order where userID=?";
      connected.query(checkUuid, uuid, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0]) {
          return SendError(res, 404, EMessage.NotFound + " order");
        }

        return SendSuccess(res, SMessage.SelectOne, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getByStatus(req, res) {
    try {
      const uuid = req.params.userID;
    
      const { status } = req.body;
      if (!status) return SendError400(res, EMessage.BadRequest, "status");
      const checkStatus = Object.keys(StatusOrder).includes(status);
      if (!checkStatus) {
        return SendError(res, 404, EMessage.NotFound, "status");
      }
      const checkUuid = "select * from tb_order where userID=? and status=?";
      connected.query(checkUuid, [uuid,status], (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound + " order", err);
        if (!result[0]) {
          return SendError(res, 404, EMessage.NotFound + " order");
        }

        return SendSuccess(res, SMessage.SelectOne, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async insert(req, res) {
    try {
      const { userID, totalPrice } = req.body;
      const validate = await ValidateData({ userID, totalPrice });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const checkuserID = await FindOneUser(userID) // ส้าง service;
      if(!checkuserID){
        return SendError(res,404,EMessage.NotFound,"userID")
      }
      const oUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const sql = `insert into tb_order (oUuid,userID,totalPrice,status,createdAt,updatedAt) 
            values (?,?,?,?,?,?)`;
      connected.query(
        sql,
        [
          oUuid,
          userID,
          totalPrice,
          StatusOrder.padding,
          datetime,
          datetime,
        ],
        (err) => {
          if (err) return SendError(res, 404, EMessage.ErrorInsert, err);
          return SendSuccess(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }

  static async UpdateOrderStatus(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const { status } = req.body;
      if (!status) return SendError400(res, EMessage.BadRequest, "status");
      const checkStatus = Object.keys(StatusOrder).includes(status);
      if (!checkStatus) {
        return SendError(res, 404, EMessage.NotFound, "status");
      }
      const checkOuuid = await FindOneOrder(oUuid); // ส้าง service ดิงใช้
      if (!checkOuuid) {
        return SendError(res, 404, EMessage.NotFound, "order");
      }
      const update = "Update tb_order set status=? where oUuid=?";
      connected.query(update, [status, oUuid], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        return SendSuccess(res, SMessage.Update);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async UpdateOrder(req, res) {
    try {
      const oUuid = req.params.oUuid;
      const { totalPrice } = req.body;
      if (!totalPrice){
        return SendError400(res, EMessage.BadRequest, "totalPrice");
      }
      const checkOuuid = await FindOneOrder(oUuid);
      if (!checkOuuid) {
        return SendError(res, 404, EMessage.NotFound, "order");
      }
      const bill = req.files;
      if (!bill || !bill.bill) {
        return SendError400(res, EMessage.BadRequest + "bill is required!");
      }
      const bill_Url = await UploadImageToCloud(bill.bill.data);
      if (!bill_Url) {
        return SendError400(res, EMessage.BadRequest + " Upload bill Error");
      }

      const update = "Update tb_order set totalPrice=?,bill=? where oUuid=?";
      connected.query(update, [totalPrice, bill_Url,oUuid], (err) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        return SendSuccess(res, SMessage.Update);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  
  }
  static async deleteOrder(req, res) {
    try {
      const oUuid = req.params.oUuid;
      if (!oUuid) return SendError400(res, EMessage.BadRequest + "oUuid");
      const checkOrder = "select * from tb_order where oUuid=?";
      connected.query(checkOrder, oUuid, (error, result) => {
        if (error) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + " id");
        const mysql = "delete from tb_order where oUuid=?";
        connected.query(mysql, oUuid, (err) => {
          if (err) return SendError400(res, EMessage.NotFound, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
