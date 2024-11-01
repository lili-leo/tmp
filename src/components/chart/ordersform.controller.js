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
async function addOrderSql(paymentData, res) {
  const successTime = formatDateTimeForMySQL(new Date(paymentData.success_time));
  const sql = `INSERT INTO paymentrecords (openid, trade_type, success_time, name, total, payer_total, trade_source, modelId,out_trade_no)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const results = await executeQuery(sql, [
      paymentData.openid,
      paymentData.trade_type,
      successTime, // 使用成功格式化后的日期时间
      paymentData.name,
      paymentData.total,
      paymentData.payer_total,
      paymentData.trade_source,
      paymentData.modelId,
      paymentData.out_trade_no
    ]);

    console.log(results);
    if (res) {
      res.send({ success: true, message: 'Payment record inserted successfully' });
    }
  } catch (error) {
    console.error('Error inserting payment record:', error);
    if (res) {
      res.status(500).send({ success: false, message: 'Internal server error' });
    }
  }
}
// Create and Save a new Ordersform
exports.addOrder = async (req, res) => {
  let paymentData = req
  if (res) {
    paymentData = req.body
  }
  // const paymentData = req.body; // 假设请求体包含要插入的支付数据
  addOrderSql(paymentData, res)
  // 格式化日期时间
  // const successTime = formatDateTimeForMySQL(new Date(paymentData.success_time));
  // const sql = `INSERT INTO PaymentRecords (openid, trade_type, success_time, name, total, payer_total, trade_source, modelId,out_trade_no)
  //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  // try {
  //   const results = await executeQuery(sql, [
  //     paymentData.openid,
  //     paymentData.trade_type,
  //     successTime, // 使用成功格式化后的日期时间
  //     paymentData.name,
  //     paymentData.total,
  //     paymentData.payer_total,
  //     paymentData.trade_source,
  //     paymentData.modelId,
  //     paymentData.out_trade_no
  //   ]);

  //   console.log(results);
  //   res.send({ success: true, message: 'Payment record inserted successfully' });
  // } catch (error) {
  //   console.error('Error inserting payment record:', error);
  //   res.status(500).send({ success: false, message: 'Internal server error' });
  // }
};
//解密
function extractRandomString(inputString) {
  return inputString.slice(0, -4) + inputString.slice(-1);
}
// Retrieve all Tutorials from the database (with condition).
exports.queryOrderDetails = async (req, res) => {
  // let { openid } = req.body
  let openid = "oKJwiasxzxfrgfdgfgfgvbvhghervM"
  const query = 'SELECT * FROM paymentrecords WHERE state = 1 AND openid = ?';
  try {
    let newOpenid = extractRandomString(openid)
    const results = await executeQuery(query, [newOpenid]);
    res.status(200).send({ result: 'success', data: results });
  } catch (error) {
    res.status(500).send({ result: 'error', message: error.message });
  }
};

// Find a single Ordersform by Id
exports.findOne = (req, res) => {
  Ordersform.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Ordersform with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Ordersform with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// find all published Tutorials
exports.findAllPublished = (req, res) => {
  Ordersform.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    else res.send(data);
  });
};

// Update a Ordersform identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Ordersform.updateById(
    req.params.id,
    new Ordersform(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Ordersform with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Ordersform with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Ordersform with the specified id in the request
exports.delete = (req, res) => {
  Ordersform.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Ordersform with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Ordersform with id " + req.params.id
        });
      }
    } else res.send({ message: `Ordersform was deleted successfully!` });
  });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Ordersform.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    else res.send({ message: `All Tutorials were deleted successfully!` });
  });
};
