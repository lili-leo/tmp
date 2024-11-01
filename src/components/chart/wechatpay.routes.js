module.exports = app => {
  const wechatpay = require("../controllers/wechatpay.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  // router.post("/", wechatpay.create);

  // Retrieve all wechatpay
  router.post("/transactions_native", wechatpay.transactions_native);//生成订单
  router.post("/paymentNotification", wechatpay.paymentNotification);//回调接口
  router.get("/query", wechatpay.query);//生成订单
  router.get("/queryOpenid", wechatpay.queryOpenid);//生成订单


  app.use('/api/wechatpay', router);
};
