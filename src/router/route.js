import express from "express";
import AuthController from "../controller/auth.controller.js";
const router = express.Router();
//-------- auth -------
router.get("/user/getAll", AuthController.getAll);
router.get("/user/getOne/:uuid", AuthController.getOne);
router.post("/user/login", AuthController.login);
router.post("/user/register", AuthController.register);

export default router;
