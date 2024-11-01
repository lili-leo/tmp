const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
// const bodyParser = require('body-parser'); // 引入 body-parser
import fs from 'fs';

// 禁用 SSL 证书验证
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// 私钥跟证书
const httpsOption = {
  // key: fs.readFileSync("./server.key"),
  // cert: fs.readFileSync("./server.cert"),
}
// var corsOptions = {
//   origin: "http://localhost:8081"
// };

app.use(cors());
// 使用 CORS 中间件
// app.use((req, res, next) => {
//   if (req.secure) {
//     return res.redirect('http://' + req.headers.host + req.url);
//   }
//   next();
// });
// 使用 body-parser 解析 JSON 请求体
// app.use(bodyParser.json({ limit: '1gb' })); // 设置最大请求体为 10MB

// 使用 body-parser 解析 URL 编码请求体
// app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));
app.use('/uploads', express.static('uploads'));
app.get('/api/uploads/:filename', (req, res) => {
  const fileName = req.params.filename;
  res.sendFile(__dirname + '/uploads/' + fileName);
});
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// simple route
app.get("/", (req, res) => {
  console.log("请求到了");
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/ordersform.routes.js")(app);

require("./app/routes/wechatpay.routes.js")(app);

require("./app/routes/typemange.routes.js")(app);

require("./app/routes/toymange.routes.js")(app);

require("./app/routes/modulesmanage.routes.js")(app);

require("./app/routes/largetypemanage.routes.js")(app);

require("./app/routes/alipay.routes.js")(app);


app.use('/api/wechatpay', createProxyMiddleware({ target: 'https://pay.weixin.qq.com', changeOrigin: true }))
// set port, listen for requests
const PORT = process.env.PORT || 8869;
// 创建https
const https = require("https").Server(httpsOption, app)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

