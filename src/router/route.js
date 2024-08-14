import express from "express";
import AuthController from "../controller/auth.controller.js";
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
export default router;
