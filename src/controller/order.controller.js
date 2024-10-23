import { UploadImageToCloud } from "../config/cloudinary";
import connected from "../config/db.js";
import { EMessage, SMessage, StatusOrder } from "../service/message.js";
import { SendError, SendError400, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { v4 as uuidv4 } from "uuid";
export default class OrderController {
   
  static async insert(req, res) {
    try {
      const { userID, totalPrice } = req.body;
      const validate = await ValidateData({ userID, totalPrice });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const bill = req.files;
      if (!bill || !bill.bill) {
        return SendError400(res, EMessage.BadRequest + "bill is required!");
      }
      const bill_Url = await UploadImageToCloud(bill.bill.data);
      if (!bill_Url)
        return SendError400(res, EMessage.BadRequest + " Upload bill Error");

      const oUuid = uuidv4();
      const datetime = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const sql = `insert into tb_order (oUuid,userID,totalPrice,bill,status,createdAt,updatedAt) 
            values (?,?,?,?,?,?,?)`;
      connected.query(
        sql,
        [
          oUuid,
          userID,
          totalPrice,
          bill,
          StatusOrder.await,
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
}
