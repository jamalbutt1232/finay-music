const Receipt = require("../models/Receipt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const assert = require("assert");
const iap = require("../iap");

// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  jwt.verify(req.token, ENV.TOKEN_SECRET, function (err, data) {
    if (err) {
      const result = {
        status_code: 403,
        status_msg: `Invalid token`,
      };
      res.status(403).send(result);
    } else {
      uid = data._id;
    }
  });
  return uid;
};

const saveReceipt = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const { userId } = req;
    const { appType, purchase } = req.body;

    assert(["ios", "android"].includes(appType));

    const receipt =
      appType === "ios"
        ? purchase.transactionReceipt
        : {
            packageName: androidPackageName,
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
            subscription: true,
          };

    await processPurchase(appType, userId, receipt);
    res.end();
  }
};
async function processPurchase(app, userId, receipt) {
  await iap.setup();
  const validationResponse = await iap.validate(receipt);

  // Sanity check
  assert(app === "ios" && validationResponse.service === "apple");

  const purchaseData = iap.getPurchaseData(validationResponse);
  const firstPurchaseItem = purchaseData[0];

  const isCancelled = iap.isCanceled(firstPurchaseItem);
  // const isExpired = iap.isExpired(firstPurchaseItem);
  const { productId } = firstPurchaseItem;
  const origTxId =
    app === "ios"
      ? firstPurchaseItem.originalTransactionId
      : firstPurchaseItem.transactionId;
  const latestReceipt =
    app === "ios" ? validationResponse.latest_receipt : JSON.stringify(receipt);
  const startDate =
    app === "ios"
      ? new Date(firstPurchaseItem.originalPurchaseDateMs)
      : new Date(parseInt(firstPurchaseItem.startTimeMillis, 10));
  const endDate =
    app === "ios"
      ? new Date(firstPurchaseItem.expiresDateMs)
      : new Date(parseInt(firstPurchaseItem.expiryTimeMillis, 10));

  let environment = "";
  // validationResponse contains sandbox: true/false for Apple and Amazon
  // Android we don't know if it was a sandbox account
  if (app === "ios") {
    environment = validationResponse.sandbox ? "sandbox" : "production";
  }

  await updateSubscription({
    userId,
    app,
    environment,
    productId,
    origTxId,
    latestReceipt,
    validationResponse,
    startDate,
    endDate,
    isCancelled,
  });
}
async function updateSubscription({
  app,
  environment,
  origTxId,
  userId,
  validationResponse,
  latestReceipt,
  startDate,
  endDate,
  productId,
  isCancelled,
}) {
  const data = {
    app,
    environment,
    user_id: userId,
    orig_tx_id: origTxId,
    validation_response: JSON.stringify(validationResponse),
    latest_receipt: latestReceipt,
    start_date: startDate,
    end_date: endDate,
    product_id: productId,
    is_cancelled: isCancelled,
  };

  //   try {
  //     await knex("subscriptions").insert(data);
  //   } catch (err) {
  //     if (err.code !== "ER_DUP_ENTRY") throw err;

  //     await knex("subscriptions").where("orig_tx_id", origTxId).update(data);
  //   }
}

module.exports = {
  saveReceipt,
};
