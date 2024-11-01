const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

var connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.POST,
  charset: 'utf8mb4',
  connectTimeout: 5000,
});
// 连接数据库
connection.connect(function (err) {
  if (err) { console.log("连接失败") } else {
    console.log("连接成功,当前连接线程ID" + connection.threadId);
  };
})
module.exports = connection;
