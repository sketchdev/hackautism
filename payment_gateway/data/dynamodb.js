const defaultRegion = process.env.AWS_DEPLOYED_REGION || 'us-east-1';
const AWS = require('aws-sdk');
const logger = require('../lib/logger');

// set region if not set (if not set by the SDK by default)
if (!AWS.config.region) {
  AWS.config.update({ region: defaultRegion });
}

const docClient = new AWS.DynamoDB.DocumentClient();
const table = process.env.PAYMENT_GATEWAY_TABLE || 'lbpaymentgateway';


exports.createUserPaymentAccount = (sourceApp, userName, customerId) => {
  const tableUsername = userName + sourceApp;
  const params = {
    TableName: table,
    Item: {
      "username": tableUsername,
      "status": 'active',
      "processorCustomerId": customerId
    }
  };

  logger.info(`Adding ${tableUsername} to ${table}...`);
  return new Promise((resolve, reject) => {
    docClient.put(params, function(err, data) {
      if (err) {
        logger.error(`Unable to add item. Error JSON: ${err}`);
        reject(err);
      }
      else {
        logger.info("Added item:", JSON.stringify(data, null, 2));
        resolve(data);
      }
    });
  });
};

exports.getUserPaymentAccount = (sourceApp, userName) => {
  const tableUsername = userName + sourceApp;
  const params = {
    TableName: table,
    Key: {
      "username": tableUsername
    }
  };

  logger.info(`Searching ${table} for ${tableUsername}...`);
  return new Promise((resolve, reject) => {
    docClient.get(params, function(err, data) {
      if (err) {
        console.log(err);
        logger.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        reject(err);
      }
      else {
        console.log(data);
        resolve(data);
      }
    });
  });
};
