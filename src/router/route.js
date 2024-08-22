import express from "express";
import AuthController from "../controller/auth.controller.js";
import BannerController from "../controller/banner.controller.js";
import CategoryController from "../controller/category.controller.js";
import ProductController from "../controller/product.controller.js";
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
router.get("/banner/getAll", BannerController.getAll);
router.get("/banner/getOne/:bUuid", BannerController.getOne);
router.put("/banner/update/:bUuid",auth,BannerController.updateBanner);
router.delete("/banner/delete/:bUuid",auth,BannerController.deleteBanner);
// ------- category -----
router.post("/category/insert",auth,CategoryController.insert);
router.get("/category/getAll", CategoryController.getAll);
router.get("/category/getOne/:cUuid", CategoryController.getOne);
router.put("/category/update/:cUuid",auth,CategoryController.updateCategory);
router.delete("/category/delete/:cUuid",auth,CategoryController.deleteCategory);
// ------- product -----
router.post("/product/insert",auth,ProductController.insert);
router.get("/product/getAll", ProductController.getAll);
router.get("/product/getOne/:pUuid", ProductController.getOne);
router.get("/product/getBy/:categoryID", ProductController.getByCategory);
router.put("/product/update/:pUuid",auth,ProductController.updateProduct);
router.delete("/product/delete/:pUuid",auth,ProductController.deleteProduct);

export default router;
