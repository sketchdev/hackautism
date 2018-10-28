const logger = require('./logger');
const stripe = require('stripe')(process.env.PAYMENT_PROCESSOR_KEY);
stripe.setApiVersion('2018-09-24');  // set the stripe version to avoid potential, future breaking changes

//TODO: This file needs some attention to errors that might be thrown by stripe (see https://stripe.com/docs/api/errors and https://stripe.com/docs/api/errors/handling)

/**
 * Creates a customer object at the processor. Creating a customer there allows for payment medium assignment and
 * recurring charges to said payment medium.
 *
 * @param sourceApp - name of the application that called the payment gateway (string)
 *                    (used for record-keeping purposes in the description field of the processor's customer object)
 * @param userName - username as recorded in the source application (string)
 *                   (used for back-reference when looking at the processor's users; stored in metadata for the user)
 * @param paymentTokenId - the token id for the payment medium (i.e. the token for a credit card obtained through tokenizeCardInfo())
 * @returns {Promise.<*>}
 */
exports.createCustomer = async (sourceApp, userName, paymentTokenId) => {
  return await stripe.customers.create(
    {
      description: `Created by LifeBinder Payment Gateway for source app ${sourceApp}.`,
      source: paymentTokenId,
      metadata: { paymentGatewayUsername: userName + sourceApp }
    },
    { idempotency_key: userName + sourceApp }
  );
};

/**
 * Updates the card or card information tied to the customer
 *
 * @param customerId - the processor's id for the customer
 * @param paymentTokenId - the token id for the payment medium (i.e. the token for a credit card obtained through tokenizeCardInfo())
 * @returns {Promise.<void>} - Promise returns a customer object; customer.id is the important part
 */
exports.updateCustomerPayment = async (customerId, paymentTokenId) => {
  await stripe.customers.update(customerId, { source: paymentTokenId });
};

/**
 * Takes a card object and gets a unique token back from the processor. Using this process limits PCI footprint of this
 * application by not further passing or storing the actual card information through this system.
 *
 * @param card - card is an object with a minimum of the following keys:
 *                 number - credit card number (string)
 *                 expMonth - credit card expiration month (int)
 *                 expYear - credit card expiration year (4-digit int)
 *                 cvc - security code on the card (string)
 * @returns {Promise.<*>} - Promise returns a token object; token.id is the important part
 *                          token.card.(id|brand|last4) may be useful too
 */
exports.tokenizeCardInfo = async (card) => {
  return await stripe.tokens.create({
    card: {
      "number": card.number,
      "exp_month": card.expMonth,
      "exp_year": card.expYear,
      "cvc": card.cvc
    }
  });
};

/**
 * Assign the specified customer to a recurring service plan
 *
 * @param customerId - the processor's id for the customer
 * @param planId - the processor's id for the recurring service plan
 * @returns {Promise.<void>} - Promise returns a subscription, none of which is really valuable for the payment gateway
 */
exports.subscribeCustomerToPlan = async (customerId, planId) => {
  await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ plan: planId }]
      },
      { idempotency_key: customerId + planId }
  );
};
