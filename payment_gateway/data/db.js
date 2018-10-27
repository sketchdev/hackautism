const connector = require('./dynamodb');
const logger = require('../lib/logger');

exports.createUserPaymentAccount = async(sourceApp, userName, processorCustomerId) => {
  try {
    await connector.createUserPaymentAccount(sourceApp, userName, processorCustomerId);
    return true;
  } catch (err) {
    return false;
  }
};

exports.getUserPaymentAccount = async(sourceApp, userName) => {
  return await connector.getUserPaymentAccount(sourceApp, userName);
};
