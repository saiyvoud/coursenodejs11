// commond js ແມ່ນການຂຽນແບບ required module
// const express = require("express"); // ຂຽນງ່າຍແລະ ຫາຂໍ້ມູນໄດ້ງ່າຍ ສ່ວນຂໍເສຍ ຂຽນ class module ເຂົ້າໃຈຍາກ ເຫມາະກັບມືໃຫມ່ຫັດຂຽນ
// const app = express();

// app.listen(3000,()=>{
//     console.log(`Server running on http://localhost:3000`);
// })

// ES ແມ່ນການຂຽນແບບ import module //
import "./config/db.js";
import express from "express"; // ເຂົ້າໃຈງ່າຍ ຂຽນງ່າຍ ສ້າງ class ສາມາດປະຍຸກເປັນ OOP ໄດ້
import cors from "cors";
import bodyParser from "body-parser";
import router from "./router/route.js";
import { PORT } from "./config/globalKey.js";
import fileUpload from "express-fileupload";
const app = express();
app.use(cors()); // ແມ່ນການເອີ້ນ request ຂໍ້ມູນ ແລະ response ຂໍ້ມູນ
app.use(fileUpload());
app.use(bodyParser.json({ extended: true, limit: "500mb" })); // ແປງຂໍ້ມູນ string ເປັນ json
app.use(
  bodyParser.urlencoded({ extended: true, parameterLimit: 500, limit: "500mb" })
);
app.use("/api", router);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // string code`` , single code '' , double code ""
});
