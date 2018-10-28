if (process.argv.length < 6) {
  console.log('');
  console.log('You must call this script with the following syntax:');
  console.log('');
  console.log('    node create-product.js <stripe_secret_key> <product_name> <price> <billing_interval>');
  console.log('');
  console.log('where');
  console.log('    stripe_secret_key - this is set to the API secret key obtained from https://dashboard.stripe.com/account/apikeys');
  console.log('    product_name - product’s name as meant to be displayable to the customer');
  console.log('    price - price of the product *in cents* (i.e. $5.00 should be specified as 500)');
  console.log('    billing_interval - one of: day  week  month  year');
  console.log('');
  console.log('');
  console.log('Example:');
  console.log('');
  console.log('    node create-product.js sk_test_BQokikJOvBiI2HlWgH4olfQ2 "Something Product Name" 1500 week');
  console.log('');
  console.log('');
  process.exit(1);
}

const stripe = require('stripe')(process.argv[2]);
stripe.setApiVersion('2018-09-24');  // set the stripe version to avoid potential, future breaking changes

const createProductPlan = async (productName, planAmount, interval) => {
  if (!['day','week','month','year'].includes(interval)) {
    console.log('');
    console.log(`Interval set to '${interval}' but must be one of: day  week  month  year`);
    console.log('');
    console.log('');
    process.exit(2);
  }

  const plan = await stripe.plans.create({
    amount: planAmount,
    interval: interval,
    product: {
      name: productName
    },
    currency: "usd",
    nickname: `${productName} ${interval}`
  });

  console.log('');
  console.log(`Plan ID = ${plan.id}`);
  console.log('');
  console.log('Copy this plan id to provide it to any applications of yours (i.e. PathBinder Web) that will allow this plan as a selectable option.');
  console.log('You can find this plan id again by viewing plans on your Stripe dashboard in the Billing > Products section at https://dashboard.stripe.com/test/subscriptions/products');
  console.log('');
  console.log('');
};

createProductPlan(process.argv[3], process.argv[4], process.argv[5]);
