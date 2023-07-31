import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import {
  aws_cognito,
  aws_secretsmanager,
  aws_lambda,
  aws_appsync,
  aws_dynamodb,
} from "aws-cdk-lib";
export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackendQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const userPool = new aws_cognito.UserPool(this, "Pool", {
      selfSignUpEnabled: true,
      accountRecovery: aws_cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: aws_cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const secret = aws_secretsmanager.Secret.fromSecretAttributes(
      this,
      "CognitoClientSecret",
      {
        secretCompleteArn:
          "arn:aws:secretsmanager:us-east-1:754509966853:secret:octotastic/google/clientSecret-qX1Ihx",
      }
    ).secretValue;

    const provider = new aws_cognito.UserPoolIdentityProviderGoogle(
      this,
      "Google",
      {
        clientId:
          "113942170177-0t72njcr8h8fvj4ckacsdsvtkhuudkke.apps.googleusercontent.com",
        clientSecretValue: secret,
        userPool: userPool,
      }
    );

    userPool.registerIdentityProvider(provider);

    const userPoolClient = new aws_cognito.UserPoolClient(
      this,
      "amplifyClient",
      {
        userPool,
        oAuth: {
          callbackUrls: ["http://localhost:5173/"], // This is what user is allowed to be redirected to with the code upon signin. this can be a list of urls.
          logoutUrls: ["http://localhost:5173/"], // This is what user is allowed to be redirected to after signout. this can be a list of urls.
        },
      }
    );

    const domain = userPool.addDomain("domain", {
      cognitoDomain: {
        domainPrefix: "eru-test-pool", // SET YOUR OWN Domain PREFIX HERE
      },
    });
    new cdk.CfnOutput(this, "aws_user_pools_web_client_id", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "aws_project_region", {
      value: this.region,
    });
    new cdk.CfnOutput(this, "aws_user_pools_id", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "domain", {
      value: domain.domainName,
    });

    // apsyncc code

    const api = new aws_appsync.GraphqlApi(this, "Api", {
      name: "cdk-todos-appsync-api",
      schema: aws_appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: aws_appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    const todosLambda = new aws_lambda.Function(this, "AppSyncNotesHandler", {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "main.handler",
      code: aws_lambda.Code.fromAsset("functions"),
      memorySize: 1024,
    });
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);

    lambdaDs.createResolver("GetT", {
      typeName: "Query",
      fieldName: "getTodos",
    });

    lambdaDs.createResolver("CreateTodo", {
      typeName: "Mutation",
      fieldName: "addTodo",
    });

    
    lambdaDs.createResolver("CreateOrder", {
      typeName: "Mutation",
      fieldName: "addOrder",
    });

    // lambdaDs.createResolver({
    //   typeName: "Mutation",
    //   fieldName: "deleteTodo",
    // });

    // lambdaDs.createResolver({
    //   typeName: "Mutation",
    //   fieldName: "updateTodo",
    // });

    // order table

    const ordersTable = new aws_dynamodb.Table(this, "CDKordersTable", {
      partitionKey: {
        name: "id",
        type: aws_dynamodb.AttributeType.STRING,
      },
    });

    // const todosTable = new aws_dynamodb.Table(this, "CDKTodosTable", {
    //   partitionKey: {
    //     name: "id",
    //     type: aws_dynamodb.AttributeType.STRING,
    //   },
    // });
    // todosTable.grantFullAccess(todosLambda);
    ordersTable.grantFullAccess(todosLambda);
    // todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);
    todosLambda.addEnvironment("ORDERS_TABLE", ordersTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    // Prints out the AppSync GraphQL API ID to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIID", {
      value: api.apiId || "",
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });
  }
}
