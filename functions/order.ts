import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// const AWS = require('aws-sdk');
// const docClient = new AWS.DynamoDB.DocumentClient();
import { OrderInput } from "./Product";

async function addOrder(order: OrderInput) {
  const params = {
    TableName: process.env.ORDERS_TABLE,
    Item: order,
  };
  try {
    const command = new PutCommand(params);
    const response = await docClient.send(command);

    // await docClient.put(params).promise();
    console.log(response);
    return order;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export default addOrder;

export async function getOrders() {
  const params = {
    TableName: process.env.ORDERS_TABLE,
  };
  try {
    const command = new ScanCommand(params);
    const response = await docClient.send(command);

    // await docClient.put(params).promise();
    console.log(response.Items);
    return response.Items;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}
