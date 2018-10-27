sam package --template-file ./template.yaml --s3-bucket sam-skeleton --output-template-file packaged.yaml &&
    sam deploy --template-file ./packaged.yaml --stack-name sam-skeleton-api-stack --capabilities CAPABILITY_IAM --parameter-overrides StageNameParam=prod
