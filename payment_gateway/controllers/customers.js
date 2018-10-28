const express = require('express');
const router = express.Router();
const logger = require('../lib/logger');
const db = require('../data/db');
const processor = require('../lib/processor');


const isEmpty = (obj) => {
  for(const key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
};

/**
 * This method creates a new user payment account for an application
 *
 * request body params:
 *   - username - the app username of the user this payment is being set up for
 *   - planId - the card processor's subscription plan id of the service being registered for (i.e. "Free," "Basic," "Premium," etc.) (string)
 *   - card - a json card object of the user's payment information containing a minimum of the following:
 *     - number - the card number (string)
 *     - expMonth - card expiration month (int)
 *     - expYear - card expiration year (4-digit int)
 *     - cvc - card's security id (3-digit string)
 */
router.post('/', async (req, res) => {
  try {
    logger.info('Received a request to create a new customerPaymentAccount.');
    const username = req.body.username;
    const sourceApp = req.header('Source-App') || 'default';
    const card = req.body.card;
    const planId = req.body.planId;

    // see if account already exists in our database
    const result = await db.getUserPaymentAccount(sourceApp, username);
    if (!isEmpty(result)) {
      logger.info('customerPaymentAccount already exists. NOT creating a new one.');
      res.sendStatus(201);
      return;
    }

    // didn't already have one, so create a new customer
    const token = await processor.tokenizeCardInfo(card);
    const customer = await processor.createCustomer(sourceApp, username, token.id);
    await processor.subscribeCustomerToPlan(customer.id, planId);
    const customerPaymentAccountAdded = await db.createUserPaymentAccount(sourceApp, username, customer.id);
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
