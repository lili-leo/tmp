import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
const axios = require('axios');
const path = require("path");
const apiclient_cert = path.resolve(__dirname, 'apiclient_cert.pem');
const apiclient_key = path.resolve(__dirname, 'apiclient_key.pem');
const appid = ''
const mysecret = ""
const pay = new WxPay({
  appid: appid,     
  mchid: '',//商户号
  publicKey: fs.readFileSync(), // 公钥
  privateKey: fs.readFileSync(), // 秘钥
  // publicKey: '123', // 公钥
  // privateKey:'123', // 秘钥
  key: '',//APIv3密钥
});
const Ordersform = require("../models/db.js");
const dayjs = require('dayjs');
// 执行异步查询函数
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    // 执行查询
    Ordersform.query(query, params, (error, results) => {
      // 释放连接
      if (error) {
        reject(error);
      } else {
        resolve(results); // 将查询结果传递给Promise的resolve方法
      }
    });
  });
}
// 转换并格式化日期时间为 MySQL 可接受的格式（保留时区信息）
function formatDateTimeForMySQL(dateTimeString) {
  const dateTime = dayjs(dateTimeString).format('YYYY-MM-DD HH:mm:ss');
  return dateTime;
}
//随机3位
function generateRandomString() {
  let randomString = '';
  for (let i = 0; i < 3; i++) {
    randomString += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return randomString;
}
//插入3位
function insertRandomString(inputString) {
  let randomString = generateRandomString();
  let output = inputString.slice(0, -1) + randomString + inputString.slice(-1);
  return output;
}
//解密
function extractRandomString(inputString) {
  return inputString.slice(0, -4) + inputString.slice(-1);
}

// 获取订单
exports.transactions_native = async (req, res) => {
  // let randomNumber = () => {
  //   const date = new Date();
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const hours = date.getHours().toString().padStart(2, '0');
  //   const minutes = date.getMinutes().toString().padStart(2, '0');
  //   const seconds = date.getSeconds().toString().padStart(2, '0');
  //   const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  //   return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  // }
  // let needout_trade_no = randomNumber()
  let { out_trade_no, modelJsonArray } = req.body
  console.log(out_trade_no);
  let description = "测试22"
  const params = {
    description: description,//商品名字
    out_trade_no: out_trade_no,//商家自己生成的订单号，就是自己生成一个订单号，最好是数字的
    notify_url: 'http://three.012331.com:28954/api/wechatpay/paymentNotification',// 接收支付通知的回调 URL，要公网可以访问的接口  
    amount: {
      total: 1,// 订单总金额，单位为分
      // currency,//一般填'CNY'，表示人民币，不用更改，不过要填
    },
    scene_info: {
      payer_client_ip: 'ip',
    },
    // payer: {
    //   openid,//微信用户的openid（主要前端获取的）
    // },
  };
  try {
    const result = await pay.transactions_native(params);
    console.log(result);
    const query = 'SELECT * FROM paymentrecords WHERE out_trade_no = ? AND trade_source = ?';
    const results = await executeQuery(query, [out_trade_no, 'weixin']);
    if (results.length == 0) {//name  trade_source   total  out_trade_no  
      // const sql = `INSERT INTO paymentrecords (openid, trade_type, success_time, name, total, payer_total, trade_source, modelId,out_trade_no)
      //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const sql = `INSERT INTO paymentrecords (name, trade_source, total,out_trade_no,state,modelJsonArray)
      VALUES (?, ?, ?, ?, ?, ?)`
      await executeQuery(sql, [description, 'weixin', 1, out_trade_no, 0, modelJsonArray]);
    }
    return res.status(200).send(result.data)
  } catch (error) {
    res.status(500).send({ result: 'error', message: error.message });
  }
};

// 接收支付结果通知（记住！这个是微信调用的接口函数，不是你自己调用的，就是填写那个notify_url
// 现在还是函数而已，到时用到真正的接口路由中就好了
exports.paymentNotification = async (req, res) => {
  console.log("微信调用啦！")
  //解密通知参数(照搬就好了)
  const decrypted = await pay.decipher_gcm(
    req.body.resource.ciphertext,
    req.body.resource.associated_data,
    req.body.resource.nonce,
    'Whymkjgfyxgs01234567899876543210',//这个是apiv3的密钥，是得去微信支付自己设置的，不是证书里的文件的
  );
  //获取请求头方便一些，存成常量
  const headers = req.headers

  //获取微信发下来的签名我们需要用自己的apiv3密钥去验证的
  const params = {
    body: req.body, // 请求体 body
    signature: headers['wechatpay-signature'],
    serial: headers['wechatpay-serial'],
    nonce: headers['wechatpay-nonce'],
    timestamp: headers['wechatpay-timestamp'],
  };
  // {
  //   mchid: "1674941867",
  //   appid: "wxf650bb3bce6255c6",
  //   out_trade_no: "20240722201456094",//订单号
  //   transaction_id: "4200002434202407224745809320",
  //   trade_type: "NATIVE",//支付类型
  //   trade_state: "SUCCESS",
  //   trade_state_desc: "支付成功",
  //   bank_type: "SPDB_DEBIT",
  //   attach: "",
  //   success_time: "2024-07-22T20:15:11+08:00",//支付时间
  //   payer: {
  //     openid: "oKJwi7dV7YpgX1AwzXgTVhxfztvM",//微信用户在商户对应AppID下的唯一标识
  //   },
  //   amount: {//订单金额 
  //     total: 1,//总金额
  //     payer_total: 1,//用户支付金额
  //     currency: "CNY",
  //     payer_currency: "CNY",
  //   },
  // }
  // res.send()
  // 直接使用库去验证签名（因为WxPay我们前面已经是配置成实例了）
  const ret = await pay.verifySign(params);
  // 返回验证结果
  console.log('验签结果(bool类型):' + ret)
  //做验证结果处理
  if (ret) {
    // 处理订单逻辑
    console.log("支付成功！！！！")
    let { out_trade_no, payer, trade_type, amount } = decrypted
    let success_time = formatDateTimeForMySQL(new Date(decrypted.success_time));
    const query = 'SELECT * FROM paymentrecords WHERE out_trade_no = ? AND trade_source = ?';
    let results = await executeQuery(query, [out_trade_no, 'weixin']);
    if (results.length > 0) {
      //如果查询到成功支付直接返回
      if (results[0].state == 1) {
        return res.status(200).send('success');
      }
      //自己数据库的更新订单状态
      const updateQuery = "UPDATE paymentrecords SET openid = ?,success_time = ?,trade_type = ?,payer_total = ?, state = ? WHERE out_trade_no = ?";
      await executeQuery(updateQuery, [payer.openid, success_time, trade_type, amount.payer_total, 1, out_trade_no]);
    }
    // 返回成功（一定要返回200）
    res.status(200).send('success');
  } else {
    console.log("支付失败,TWT~~~~")
    // 签名验证失败（一定要返回400）
    res.status(400).send('失败啦！');
  }
}

exports.query = async (req, res) => {
  let out_trade_no = req.query.out_trade_no
  const result = await pay.query({ out_trade_no });
  console.log(result);
  res.status(200).send(result.data)
}

exports.queryOpenid = async (req, res) => {
  let { code } = req.query
  let grant_type = "authorization_code"
  let url =
    "https://api.weixin.qq.com/sns/jscode2session?grant_type=" +
    grant_type +
    "&appid=" +
    appid +
    "&secret=" +
    mysecret +
    "&js_code=" +
    code;
  axios.get(url)
    .then(result => {
      let openid = result.data.openid
      if (openid) {
        console.log("成功openid");
        res.status(200).send({ openid: insertRandomString(openid) })
      } else {
        res.status(400).send('失败啦！');
      }
    })
    .catch(error => {
      res.status(400).send('失败啦！');
    });
}


