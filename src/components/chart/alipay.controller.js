//引入支付宝配置文件
const alipaySdk = require('../config/alipay.js');
const axios = require('axios');
const AlipayFormData = require('alipay-sdk/lib/form').default;
const ordersform = require("../controllers/ordersform.controller.js");
console.log(ordersform);
exports.payment = async (req, res) => {
  const { price, name, out_trade_no } = req.body
  console.log('reqreqreqreqreq', req);
  // return
  //订单号
  // let id = req.body.id || JSON.parse(Object.keys(req.body)).id;
  //商品总价
  // let price = price
  //购买商品的名称
  // let name = name
  //开始对接支付宝API
  const formData = new AlipayFormData()
  //调用 setMethod 并传入 get ， 会返回可以跳转到支付页面的url
  formData.setMethod('get');
  //支付时信息
  // res.send({name:1})
  formData.addField('bizContent', {
    //订单号
    outTradeNo: out_trade_no,
    qr_pay_mode: 4,
    // trade_no: id,
    //写死的
    productCode: 'FAST_INSTANT_TRADE_PAY',
    //价格
    totalAmount: price,
    //商品名称
    subject: name,
    //商品详情
    body: '商品详情',
  });
  // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  // formData.addField('notifyUrl', 'https://mes.oureman.com/mes/mc/91166');
  // 当支付完成后，当前页面跳转的地址
  // formData.addField('returnUrl', 'http://192.168.10.28:3000/photosInfo');
  //返回一个promise
  const result = alipaySdk.exec(
    'alipay.trade.page.pay',
    {},
    { formData: formData },
  );
  //对接支付宝成功，支付宝返回的数据
  result.then(resp => {
    res.send({
      data: {
        code: 200,
        success: true,
        msg: '支付中',
        paymentUrl: resp,
        qrcode_width: '600',
        qrcode_height: '600'
      }
    })
  })
};

/**
 * 添加购物车提交订单支付宝支付后查询订单状态是否成功 */
// exports.payment = async (req, res) => 统一收单交易查询
// router.post('/api/member/queryOrderAlipay', (req, res) => {
exports.tradeQuery = async (req, res) => {
  const { out_trade_no } = req.body
  const formData = new AlipayFormData();
  formData.setMethod('get');
  formData.addField('bizContent', {
    // trade_no: "20240329180309960",
    "out_trade_no": out_trade_no,
    query_options: [
      "voucher_detail_list",
      "fund_bill_list",
      "discount_goods_detail"]
  });
  // 通过该接口主动查询订单状态
  const result = await alipaySdk.exec(
    'alipay.trade.query',
    {},
    { formData: formData },
  );
  axios({
    method: 'GET',
    url: result
  })
    .then(data => {
      let r = data.data.alipay_trade_query_response;
      if (r.code === '10000') { // 接口调用成功
        switch (r.trade_status) {
          case 'WAIT_BUYER_PAY':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status": 0,
                  "massage": '交易创建，等待买家付款'
                }
              }
            )
            break;
          case 'TRADE_CLOSED':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status": 1,
                  "massage": '未付款交易超时关闭，或支付完成后全额退款'
                }
              }
            )
            break;
          case 'TRADE_SUCCESS':
            let obj = {
              openid: r.buyer_user_id,
              trade_type: r.fund_bill_list[0].fund_channel,
              success_time: r.send_pay_date,
              name: "ali2",
              total: r.total_amount * 100,
              payer_total: r.buyer_pay_amount * 100,
              trade_source: 'alipay',
              modelId: 12345,
              out_trade_no: r.out_trade_no
            }
            ordersform.addOrder(obj)
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status": 2,
                  "massage": '交易支付成功'
                }
              }
            )
            break;
          case 'TRADE_FINISHED':
            res.send(
              {
                "success": true,
                "message": "success",
                "code": 200,
                "timestamp": (new Date()).getTime(),
                "result": {
                  "status": 3,
                  "massage": '交易结束，不可退款'
                }
              }
            )
            break;
        }
      } else if (r.code === '40004') {
        res.send('交易不存在');
      }
    })
    .catch(err => {
      res.json({
        msg: '查询失败',
        err
      });
    });

}

// 统一收单交易退款接口
exports.refund = async (req, res) => {
  const { price } = req.body
  console.log('reqreqreqreqreq', req);
  //订单号
  // let id = req.body.id || JSON.parse(Object.keys(req.body)).id;
  let id = 20240123231226
  //商品总价
  // let price = price
  //购买商品的名称
  let name = "name1"
  //开始对接支付宝API
  const formData = new AlipayFormData()
  //调用 setMethod 并传入 get ， 会返回可以跳转到支付页面的url
  formData.setMethod('get');
  //支付时信息
  // res.send({name:1})
  formData.addField('bizContent', {
    //订单号
    "out_trade_no": "20240123231226",
    "refund_amount": 1.6
  });
  // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  // formData.addField('notifyUrl', 'https://www.baidu.com');
  // 当支付完成后，当前页面跳转的地址
  // formData.addField('returnUrl', 'http://192.168.10.28:3001/');
  //返回一个promise
  const result = await alipaySdk.exec(
    'alipay.trade.refund',
    {},
    { formData: formData },
  );
  axios({
    method: 'GET',
    url: result
  }).then(data => {
    console.log(data);
    let r = data.data.alipay_trade_refund_response;
    if (r.code === '10000') { // 接口调用成功
      res.send(
        {
          "success": true,
          "message": "success",
          "code": 200,
          "timestamp": (new Date()).getTime(),
          "result": {
            "status": 0,
            "massage": '退款成功'
          }
        }
      )

    } else {
      res.send(
        {
          "success": true,
          "message": "success",
          "code": 200,
          "timestamp": (new Date()).getTime(),
          "result": {
            "status": 0,
            "massage": '退款失败'
          }
        }
      )
    }
  })
};

// 统一收单交易退款查询
exports.fastpayRefundQuery = async (req, res) => {
  const { price } = req.body
  console.log('reqreqreqreqreq', req);
  //订单号
  // let id = req.body.id || JSON.parse(Object.keys(req.body)).id;
  let id = 20240123231226
  //商品总价
  // let price = price
  //购买商品的名称
  let name = "name1"
  //开始对接支付宝API
  const formData = new AlipayFormData()
  //调用 setMethod 并传入 get ， 会返回可以跳转到支付页面的url
  formData.setMethod('get');
  //支付时信息
  // res.send({name:1})
  formData.addField('bizContent', {
    //订单号
    "out_trade_no": "20240123231226",
    "out_request_no": "20240123231226",
  });
  // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  // formData.addField('notifyUrl', 'https://www.baidu.com');
  // 当支付完成后，当前页面跳转的地址
  // formData.addField('returnUrl', 'http://192.168.10.28:3001/');
  //返回一个promise
  const result = await alipaySdk.exec(
    'alipay.trade.fastpay.refund.query',
    {},
    { formData: formData },
  );
  axios({
    method: 'GET',
    url: result
  }).then(data => {
    console.log("datadatadatadatadatadata", data);
    let r = data.data.alipay_trade_fastpay_refund_query_response;
    if (r.code === '10000') { // 接口调用成功
      res.send(
        {
          "success": true,
          "message": "success",
          "code": 200,
          "timestamp": (new Date()).getTime(),
          "result": {
            "status": 0,
            "massage": '退款成功'
          }
        }
      )
    }
  })
};

// 统一收单交易关闭接口
exports.close = async (req, res) => {
  const { price } = req.body
  console.log('reqreqreqreqreq', req);
  //订单号
  // let id = req.body.id || JSON.parse(Object.keys(req.body)).id;
  let id = 20240123231226
  //商品总价
  // let price = price
  //购买商品的名称
  let name = "name1"
  //开始对接支付宝API
  const formData = new AlipayFormData()
  //调用 setMethod 并传入 get ， 会返回可以跳转到支付页面的url
  formData.setMethod('get');
  //支付时信息
  // res.send({name:1})
  formData.addField('bizContent', {
    //订单号
    "out_trade_no": "20240123231227",
  });
  //返回一个promise
  const result = await alipaySdk.exec(
    'alipay.trade.close',
    {},
    { formData: formData },
  );
  axios({
    method: 'GET',
    url: result
  }).then(data => {
    console.log("datadatadatadatadatadata", data);
    let r = data.data.alipay_trade_close_response;
    if (r.code === '10000') { // 接口调用成功
      switch (r.trade_status) {
        case 'TRADE_SUCCESS':
          res.send(
            {
              "success": true,
              "message": "success",
              "code": 200,
              "timestamp": (new Date()).getTime(),
              "result": {
                "status": 0,
                "massage": '退款成功'
              }
            }
          )
          break;
      }
      res.send({
        data: {
          code: 200,
          success: true,
          msg: '支付中',
          // paymentUrl: resp
        }
      })
    }
  })
};