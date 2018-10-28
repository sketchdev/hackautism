Hackathon:
  Attack of the Retreating Invisible Cows

Setup Instructions
===================


AWS
----

### AWS CLI ###

Having the AWS CLI (Command Line Interface) installed helps get the credentials set up locally for running shell commands
to create resources inside of AWS.  Follow the instructions from [AWS' official documenation page](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) to get it installed.


### Serverless Info ###

A serverless version of this application has been established by leveraging the aws-serverless-express npm module. This
module wraps an Express app so that it conforms to AWS Lambda handler method signatures and can be deployed into Lambda,
yet it uses Express' router to route and deliver the requests to the appropriate controllers.

#### Running Locally ####

##### SAM-CLI Installation #####
See [AWS' official documentation](https://github.com/awslabs/aws-sam-cli#installation) for the latest instructions for
installing the SAM CLI. The abridged version is this:

  * Make sure python 2.7 is installed

    `python --version`
  * Update pip

    `pip install --user --upgrade pip`
  * Install aws-sam-cli

    `pip install --user aws-sam-cli`
  * Verify sam successfully installed

    `sam --version`

###### Issues Installing SAM-CLI ######
`pip show -f aws-sam-cli`

Should show where files were installed:
  ```Shell
  Name: aws-sam-cli
  Version: 0.3.0
  Summary: AWS SAM CLI is a CLI tool for local development and testing of Serverless applications
  Home-page: https://github.com/awslabs/aws-sam-cli
  Author: Amazon Web Services
  Author-email: aws-sam-developers@amazon.com
  License:                                  Apache License
                             Version 2.0, January 2004
                          http://www.apache.org/licenses/
  Location: /Users/rjensen/Library/Python/2.7/lib/python/site-packages
  Requires: six, click, enum34, Flask, boto3, PyYAML, cookiecutter, aws-sam-translator, docker
  Required-by:
  Files:
    ../../../bin/sam
    aws_sam_cli-0.3.0-py2.7.egg-info
    aws_sam_cli-0.3.0-py2.7.egg-info/PKG-INFO
    aws_sam_cli-0.3.0-py2.7.egg-info/SOURCES.txt
  ```

The "../../../bin/sam" entry (will be different depending on what directory you are currently in) shows where the sam executable was installed to. Ensure this absolute path is included in your PATH variable. If it is not, edit your ~/.bash_profile file to do so. This absolute path can be found by running:
`python -m site --user-base`

If this wasn't your issue, refer to the official AWS documenation mentioned above.


### Create an AWS Account ###

 * Go to https://aws.amazon.com & click sign-up
   * redirects to https://portal.aws.amazon.com/billing/signup?nc2=h_ct&src=default&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start
 * Enter personal and billing information
 * Verify info by allowing AWS to call your entered phone number and type the verification code on your phone


### Log in to AWS Account ###

 * Go to http://console.aws.amazon.com/
 * Enter root account username and password
   * you may need to enter CAPTCHA info on first login


### Create Non-Root User(s) ###

Other than to create auxiliary users or requesting service line increases, the root account should NEVER be used
for signing in to AWS. Follow these steps to set up a minimal admin user to use for the rest of this setup.

 * Go to AWS' [IAM service](https://console.aws.amazon.com/iam/home?#/users) to manage users
 * Click the 'Add user' button
   * Provide a username and password
   * Specify that this user should have programmatic and console access
   * Proceed to Permissions...
   * Click the 'Attach existing policies directly' tab
   * Select 'AdministratorAccess'
   * Click 'Review'
   * Click 'Create'
   * Copy the 'Access key ID' and the 'Secret access key' from this screen
     * **THIS IS THE ONLY TIME YOU WILL HAVE ACCESS TO THE 'SECRET ACCESS KEY', SO MAKE SURE YOU SAVE IT SOMEWHERE BEFORE PROCEEDING**
 * Use the AWS CLI (installed near the beginning of this document) to add these access keys
   * From your command line, type `aws configure`
   * Enter your Access Key
   * Enter your Secret Key
   * Enter 'us-east-1' for the 'Default region name'


### Set Up Code Bucket ###

To deploy the serverless version of this code, you will need to create a secured "bucket" in AWS' storage service.

From your command line,

  ```Shell
  aws s3 mb s3://com-pathbinder-sam
  ```


Node JS
--------

Download and follow instructions found on [node.js website](https://nodejs.org/en/). When fully and successfully installed,
you should be able to run the following commands from the command line on your local system:

  ```shell
  node -v
  
  npm -v
  ```


Stripe Payment Processor
=========================

Create Account
---------------

Setup begins by going to Stripe's homepage and [signing-up](https://dashboard.stripe.com/register)

 * Fill out all the necessary information
 * Click the verification link in the email that was sent to you from Stripe for creating a new account
 * Verify a phone number for your account as well. This is needed before the system will issue card data tokens in place
   of actual card numbers themselves
   * Go to Stripe's [phone verification page](https://dashboard.stripe.com/phone-verification)


Obtain API Key
---------------

From Stripe's dashboard page, navigate to Developers > API Keys. Or navigate directly to [API Keys](https://dashboard.stripe.com/account/apikeys).

On this page is the "Secret key". This is required for the deployment step in the "Deploying the Payment Gateway" section below.

If your full business details have not yet been provided to Stripe, the account will be in a test/sandbox mode, and the
Secret key is just for testing purposes. Once your account has been verified and activated, you will need to revisit this
section for the actual live/production key. You may need to re-trigger the deployment with the live key if you already
deployed the payment gateway with the test key.


Create a Product and Pricing Plan
----------------------------------

A utility method has been created for setting up products and pricing plans in Stripe. From your command line,

  ```Shell
  node utils/create-product.js
  ```


Deploying the Payment Gateway
==============================

Congratulations!  You're about to launch your payment gateway.  The deployment is easy to kick off and may take a couple of minutes to finish.
Besides the application code being bundled up and uploaded during the deployment, various roles, permissions, servers, and routers will also
be deployed, and that doesn't happen instantaneously.

From your command line,

  ```Shell
  ./deploy <processor_api_key>
  ```


APPENDIX
=========


Calling Applications
---------------------

### API Keys ###

To access the Payment Gateway, applications will need an API key. To generate one, from your command line,

  ```Shell
  KEY_ID=`aws apigateway create-api-key --enabled --name <application_name> --query 'id' --output text`
  aws apigateway create-usage-plan-key --key-type "API_KEY" --usage-plan-id <usage-plan-id> --key-id $KEY_ID
  aws apigateway get-api-key --api-key $KEY_ID --include-value --output text --query 'value'
  
  #Example:
    KEY_ID=`aws apigateway create-api-key --enabled --name pathbinder_web --query 'id' --output text`
    aws apigateway create-usage-plan-key --key-type "API_KEY" --usage-plan-id tf5a54 --key-id $KEY_ID
    aws apigateway get-api-key --api-key $KEY_ID --include-value --output text --query 'value'
  ```

The `usage-plan-id` (and a more fleshed-out version of the above commands) to use can be seen in the output variables from the
payment gateway deployment. This can be found by opening the CloudFormation stack when logged in to the AWS console and
browsing to the [stack list](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks?filter=active&tab=outputs).

The output of the last command executed in that set is the API key that you should use in the applications wishing to
call the Payment Gateway's service.


### Request Headers ###

#### Source App ####
Optionally, but **strongly** recommended, applications calling the payment gateway should send a header key of "Source-App" with a value
of the application's name for the payment gateway to best track who is calling it and how to properly namespace the users inside
its internal database tracking mechanism. 

#### Payment Gateway API Key ####
The payment gateway requires that applications pass an API key of their own to access the services. The key should be passed in
with the "x-api-key" header. See the "API Keys" section above for generating Payment Gateway API Keys for this purpose.


PCI Loose-Ends
---------------

PCI at AWS ain't that hard.  There's a couple of things this app needs *for compliance*, but *not* needed for normal functionality.

### Activity Logging ###

The first step is to create a bucket to hold all the AWS activity logging. From your command line,

   ```Shell
   aws s3 mb s3://com-pathbinder-pci
   aws s3api put-bucket-policy --bucket com-pathbinder-pci --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"AWSCloudTrailAclCheck\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudtrail.amazonaws.com\"},\"Action\":\"s3:GetBucketAcl\",\"Resource\":\"arn:aws:s3:::com-lifebinder-pci\"},{\"Sid\":\"AWSCloudTrailWrite\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudtrail.amazonaws.com\"},\"Action\":\"s3:PutObject\",\"Resource\":\"arn:aws:s3:::com-lifebinder-pci\/AWSLogs\/*\",\"Condition\":{\"StringEquals\":{\"s3:x-amz-acl\":\"bucket-owner-full-control\"}}}]}"
   ```

Now that the bucket is in place, the next step is to configure AWS to log all activity to the newly created
bucket. From your command line,

   ```Shell
   aws cloudtrail create-trail --name PathBinderTrail --s3-bucket-name com-pathbinder-pci --include-global-service-events --is-multi-region-trail
   aws cloudtrail start-logging --name PathBinderTrail
   ```
