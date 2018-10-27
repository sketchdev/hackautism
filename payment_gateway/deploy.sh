sam package --template-file ./template.yaml --s3-bucket lifebinder-sam --output-template-file packaged.yaml &&
    sam deploy --template-file ./packaged.yaml --stack-name lifebinder-payment-api-stack --capabilities CAPABILITY_NAMED_IAM --parameter-overrides StageNameParam=prod
