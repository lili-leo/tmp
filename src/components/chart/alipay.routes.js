module.exports = app => {
  const alipay = require("../controllers/alipay.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  // router.post("/", wechatpay.create);

  // Retrieve all wechatpay
  router.post("/tradeQuery", alipay.tradeQuery);//生成订单
  router.post("/payment", alipay.payment);//生成订单close
  router.post("/refund", alipay.refund);//生成订单
  router.post("/close", alipay.close);//生成订单
  router.post("/fastpayRefundQuery", alipay.fastpayRefundQuery);//生成订单
  // router.get("/paymentNotification", alipay.paymentNotification);//回调接口


  app.use('/api/alipay', router);
};
