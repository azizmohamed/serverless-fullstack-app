import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class ServerlessFullstackAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to host the React app
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',  // Entry point for the React app
      websiteErrorDocument: 'index.html',  // Handle routing by pointing all errors to index.html
      publicReadAccess: true,              // Make the bucket publicly accessible
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,  // Allow bucket-level public access
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // Automatically clean up the bucket on stack deletion
      autoDeleteObjects: true,             // Delete all objects in the bucket when the stack is deleted
    });

    // Deploy the React app's build folder to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./my-app/build')],  // Path to the React app's build folder
      destinationBucket: websiteBucket,
    });

    new cdk.CfnOutput(this, 'BucketWebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,  // Output the S3 website URL
      description: 'URL of the static website hosted on S3',
    });

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      signInAliases: { email: true },  // Users will sign in with email
      selfSignUpEnabled: true,         // Allow users to sign up
    });

    // Create a Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: { userPassword: true },  // Enable username/password-based authentication

    });

    // Create DynamoDB table for to-do items
    const todoTable = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a Lambda function that returns static content
    const apiLambda = new lambda.Function(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,   // Lambda runtime environment
      code: lambda.Code.fromAsset('lambda'), // Path to Lambda function code
      handler: 'handler.main',               // Lambda function handler
      environment: {
        TODO_TABLE_NAME: todoTable.tableName,  // Pass table name to the Lambda function
      },
    });

    // Grant the Lambda function permissions to read/write to the DynamoDB table
    todoTable.grantReadWriteData(apiLambda);

    var lambdaIntegration = new apigateway.LambdaIntegration(apiLambda);

    // API Gateway to expose the Lambda function
    const api = new apigateway.LambdaRestApi(this, 'ApiEndpoint', {
      handler: apiLambda,
      proxy: false,
    });

    // Cognito authorizer for API Gateway
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool]
    });

    var todoResourceOptions = {
      authorizer,  // Require Cognito authentication
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };
    // Define resource for to-do items
    const todoResource = api.root.addResource('todos');
    todoResource.addMethod('POST', lambdaIntegration, todoResourceOptions);  // Create to-do item
    todoResource.addMethod('PUT', lambdaIntegration, todoResourceOptions);   // Update to-do item
    todoResource.addMethod('DELETE', lambdaIntegration, todoResourceOptions); // Delete to-do item
    todoResource.addMethod('GET', lambdaIntegration, todoResourceOptions);
    todoResource.addMethod('OPTIONS', lambdaIntegration); // Options method for CORS support withouth authentication
  }
}