const express = require('express');
const router = express.Router();
const logger = require('../lib/logger');
const db = require('../data/db');


const isEmpty = (obj) => {
  for(const key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
};

router.post('/', async (req, res) => {
  try {
    logger.info('Received a request to create a new customerPaymentAccount.');
    const username = req.body.username;
    const sourceApp = req.header('Source-App') || 'default';

    // see if account already exists in our database
    const result = await db.getUserPaymentAccount(sourceApp, username);
    if (!isEmpty(result)) {
      logger.info('customerPaymentAccount already exists. NOT creating a new one.');
      res.sendStatus(201);
      return;
    }

    // didn't already have one, so create a new customer
    const customerPaymentAccountAdded = await db.createUserPaymentAccount(sourceApp, username, '12345');
    if (customerPaymentAccountAdded) {
      res.sendStatus(201);
    } else {
      res.status(500).json({errors : 'Unable to save the new account to the database.'});
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({errors : 'There was an error creating the new account.'});
  }
});

module.exports = router;
