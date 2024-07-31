import mysql from "mysql";
import {
  DATABASE_NAME,
  PASSWORD_DATABASE,
  PORT_DATABASE,
  URL_DATABASE,
  USER_DATABASE,
} from "./globalKey.js";

const connected = mysql.createPool({
  connectionLimit: 50,
  host: URL_DATABASE, // localhost
  queueLimit: 0,
  waitForConnections: true,
  user: USER_DATABASE, // ""
  password: PASSWORD_DATABASE, // ""
  port: PORT_DATABASE,
  database: DATABASE_NAME,
  timezone: "z",
});

connected.getConnection((err) => {
  if (err) throw err;
 
  console.log(`Connected Database`);
});

export default connected;
