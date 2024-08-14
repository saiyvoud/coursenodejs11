import { EMessage } from "../service/message.js";
import { SendError, SendError400 } from "../service/response.js";
import { ValidateData } from "../service/validate.js";

export default class BannerController {
  static async insert(req,res){
        try {
            const {title,detail} = req.body;
            const validate = await ValidateData({title,detail});
            if(validate.length){
                return SendError400(res,EMessage.PleaseInput + validate.join(","));
            }
        } catch (error) {
            
        }
    }
}