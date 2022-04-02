const iap = require("in-app-purchase");
const ENV = require("./env");
const iapTestMode = ENV.IAP_TEST_MODE === "true";

iap.config({
  // If you want to exclude old transaction, set this to true. Default is false:
  appleExcludeOldTransactions: true,
  // this comes from iTunes Connect (You need this to valiate subscriptions):
  applePassword: ENV.APPLE_SHARED_SECRET,

  /* Configurations all platforms */
  test: iapTestMode, // For Apple and Google Play to force Sandbox validation only
  // verbose: true, // Output debug logs to stdout stream
});

module.exports = iap;
