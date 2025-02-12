import { UploadImageToCloud } from "../config/cloudinary.js";
import connected from "../config/db.js";
import { EMessage, SMessage, StatusOrder } from "../service/message.js";
import {
  SendCreate,
  SendError,
  SendError400,
  SendSuccess,
} from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
import {
  FindOneOrder,
  FindOneOrderDetail,
  FindOneProduct,
  FindOneUser,
} from "../service/service.js";

export default class OrderDetailController {
  static async getAll(req, res) {
    try {
      const orderDetail = `Select * from order_detail 
        INNER JOIN product on product.pUuid COLLATE utf8mb4_general_ci = order_detail.productID`;
      connected.query(orderDetail, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const ordUuid = req.params.ordUuid;
      if (!ordUuid) {
        return SendError400(res, EMessage.BadRequest, "order detail");
      }
      const orderDetail = `Select * from order_detail 
        INNER JOIN product on product.pUuid COLLATE utf8mb4_general_ci = order_detail.productID
        WHERE order_detail.ordUuid=?`;
      connected.query(orderDetail, ordUuid, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) {
          return SendError(res, 404, EMessage.NotFound, "order detail");
        }
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getBy(req, res) {
    try {
      const orderID = req.params.orderID;
      if (!orderID) {
        return SendError400(res, EMessage.BadRequest, "order");
      }
      const orderDetail = `Select * from order_detail 
        INNER JOIN product on product.pUuid COLLATE utf8mb4_general_ci = order_detail.productID
        WHERE order_detail.orderID=?`;
      connected.query(orderDetail, orderID, (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0]) {
          return SendError(res, 404, EMessage.NotFound, "order");
        }
        return SendSuccess(res, SMessage.SelectBy, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }

  static async insert(req, res) {
    try {
      const { orderID, productID, qty, total } = req.body;
      const validate = await ValidateData({
        orderID,
        productID,
        qty,
        total,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.BadRequest, validate.join(","));
      }
      const checkOrderID = await FindOneOrder(orderID);
      if (!checkOrderID) {
        return SendError(res, 404, EMessage.NotFound, "order");
      }
      const checkProductID = await FindOneProduct(productID);
      if (!checkProductID) {
        return SendError(res, 404, EMessage.NotFound, "product");
      }
      const ordUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const insert = `Insert into order_detail 
        (ordUuid,orderID,productID,qty,total,createdAt,updatedAt) Values (?,?,?,?,?,?,?)`;
      connected.query(
        insert,
        [ordUuid, orderID, productID, qty, total, datetime, datetime],
        (err) => {
          if (err) return SendError(res, 404, EMessage.ErrorInsert, err);
          return SendCreate(res, SMessage.Insert);
        }
      );
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async UpdateOrderDetail(req, res) {
    try {
      const ordUuid = req.params.ordUuid;
      if (!ordUuid) {
        return SendError400(res, EMessage.BadRequest, "order detail");
      }
      const checkOrderDetail = await FindOneOrderDetail(ordUuid);
      if (!checkOrderDetail) {
        return SendError(res, 404, EMessage.NotFound, "order detail");
      }
      const { qty, total } = req.body;
      const validate = await ValidateData(amount, total);
      if (validate.length > 0) {
        return SendError400(res, EMessage.BadRequest, validate.join(","));
      }
      const update = "Update order_detail set qty=?,total=? where ordUuid=?";
      connected.query(update, [qty, total, ordUuid], (err) => {
        if (err) return SendError(res, 404, EMessage.ErrorUpdate, err);
        return SendSuccess(res, SMessage.Update);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async deleteOrderDetail(req, res) {
    try {
      const ordUuid = req.params.ordUuid;
      if (!ordUuid) return SendError400(res, EMessage.BadRequest + "oUuid");
      const checkOrder = "select * from order_detail where ordUuid=?";
      connected.query(checkOrder, ordUuid, (error, result) => {
        if (error) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + " id");
        const mysql = "delete from order_detail where ordUuid=?";
        connected.query(mysql, ordUuid, (err) => {
          if (err) return SendError400(res, EMessage.NotFound, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
