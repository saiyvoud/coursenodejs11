import express from "express";
import AuthController from "../controller/auth.controller.js";
import BannerController from "../controller/banner.controller.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
//-------- auth -------
router.get("/user/getAll",auth, AuthController.getAll);
router.get("/user/getOne/:uuid", AuthController.getOne);
router.post("/user/login", AuthController.login);
router.post("/user/register", AuthController.register);
router.put("/user/forget",AuthController.forgotPassword);
router.put("/user/changePassword",auth,AuthController.changePassword);
router.put("/user/refreshToken",AuthController.refreshToken);
//--------- banner -------
router.post("/banner/insert",auth,BannerController.insert);
router.get("/banner/getAll",auth, BannerController.getAll);
router.get("/banner/getOne/:bUuid", BannerController.getOne);
router.put("/banner/update/:bUuid",auth,BannerController.updateBanner);
router.delete("/banner/delete/:bUuid",auth,BannerController.deleteBanner);
export default router;
