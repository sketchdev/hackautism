#!/bin/bash -e
PROCESSOR_KEY=$1
if [ "$PROCESSOR_KEY" = "" ]; then
  echo "You must provide the secret key to access the payment processor's (i.e. Stripe) API. For example, the TEST key from Stripe's site is sk_test_BQokikJOvBiI2HlWgH4olfQ2. If using Stripe, your key can be found at https://dashboard.stripe.com/account/apikeys"
  exit 1
fi

npm prune
sam package --template-file ./template.yaml --s3-bucket pathbinder-sam --output-template-file packaged.yaml &&
    sam deploy --template-file ./packaged.yaml --stack-name pathbinder-payment-api-stack --capabilities CAPABILITY_NAMED_IAM --parameter-overrides StageNameParam=prod ProcessorApiKeyParam=$PROCESSOR_KEY
