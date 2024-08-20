import { UploadImageToCloud } from "../config/cloudinary";
import connected from "../config/db";
import { EMessage, SMessage } from "../service/message";
import {
  SendCreate,
  SendError,
  SendError400,
  SendSuccess,
} from "../service/response";
import { ValidateData } from "../service/validate";

export default class ProductController {
  static async getAll(req, res) {
    try {
      const category = `Select * from product 
        INNER JOIN category on categoryID = product.categoryID`;
      connected.query(category, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " product", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " product");
        return SendSuccess(res, SMessage.SelectAll, result);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async getOne(req, res) {
    try {
      const uuid = req.params.cUuid;
      const checkUuid = `select * from product 
      INNER JOIN category on categoryID = product.categoryID   
      where pUuid=?`;
      connected.query(checkUuid, uuid, (err, result) => {
        if (err)
          return SendError(res, 404, EMessage.NotFound + " product", err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound + " product");
        return SendSuccess(res, SMessage.SelectOne, result[0]);
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async insert(req, res) {
    try {
      const { name, detail, amount, price, categoryID } = req.body;
      const validate = await ValidateData({
        name,
        detail,
        amount,
        price,
        categoryID,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }
      const checkCategory = "select * from category where cUuid=?";
      connected.query(checkCategory, categoryID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound, " category");
        const image = req.files;
        if (!image) return SendError400(res, EMessage.BadRequest + " Image");
        const image_url = await UploadImageToCloud(image.image.data);
        if (!image_url) return SendError400(res, EMessage.ErrorUploadImage);
        const pUuid = uuidv4();
        const datetime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        const insert = `insert into product 
        (pUuid,name,detail,amount,price,categoryID,image,createdAt,updatedAt) 
        values (?,?,?,?,?,?,?,?,?)`;
        connected.query(
          insert,
          [
            pUuid,
            name,
            detail,
            amount,
            price,
            categoryID,
            image_url,
            datetime,
            datetime,
          ],
          (error) => {
            if (error) return SendError(res, 404, EMessage.ErrorInsert, err);
            return SendCreate(res, SMessage.Insert);
          }
        );
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async updateProduct(req, res) {
    try {
      const pUuid = req.params.pUuid;
      const { name, detail, amount, price, categoryID } = req.body;
      const validate = await ValidateData({
        name,
        detail,
        amount,
        price,
        categoryID,
      });
      if (validate.length > 0) {
        return SendError400(res, EMessage.PleaseInput + validate.join(","));
      }

      const checkCategory = "select * from category where cUuid=?";
      connected.query(checkCategory, categoryID, async (err, result) => {
        if (err) return SendError(res, 404, EMessage.NotFound, err);
        if (!result[0])
          return SendError(res, 404, EMessage.NotFound, " category");
        const image = req.files;
        if (!image) return SendError400(res, EMessage.BadRequest + " Image");
        const image_url = await UploadImageToCloud(image.image.data);
        if (!image_url) return SendError400(res, EMessage.ErrorUploadImage);

        const datetime = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        const update = `update product set name=? , detail=?, amount=? , price=? , 
          categoryID=? image=? ,updatedAt=? 
          where pUuid=?`;
        connected.query(
          update,
          [name, detail, amount, price, categoryID, image_url, datetime, pUuid],
          (error) => {
            if (error) return SendError(res, 404, EMessage.ErrorUpdate, err);
            return SendSuccess(res, SMessage.Update);
          }
        );
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
  static async deleteProduct(req, res) {
    try {
      const pUuid = req.params.pUuid;
      if (!pUuid) return SendError400(res, EMessage.BadRequest + "pUuid");
      const checkProduct = "select * from product where pUuid=?";
      connected.query(checkProduct, pUuid, (error, result) => {
        if (error) return SendError400(res, EMessage.NotFound, err);
        if (!result[0]) return SendError(res, 404, EMessage.NotFound + " id");
        const mysql = "delete from product where pUuid=?";
        connected.query(mysql, pUuid, (err) => {
          if (err) return SendError400(res, EMessage.NotFound, err);

          return SendSuccess(res, SMessage.Delete);
        });
      });
    } catch (error) {
      return SendError(res, 500, EMessage.ServerError, error);
    }
  }
}
