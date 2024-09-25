// lambda/handler.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const ddbClient = new DynamoDBClient();

// Create the DynamoDBDocumentClient to simplify interactions
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);


// Define the CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, GET, OPTIONS'
};

exports.main = async function (event, context) {
    try {

        const user = event.requestContext.authorizer;  // Cognito user details
        console.log('Authenticated user:', user);

        const httpMethod = event.httpMethod;
        let body;

        if (event.body) {
            body = JSON.parse(event.body);
        }

        switch (httpMethod) {
            case 'POST':  // Create a to-do item
                const newItem = {
                    id: body.id,
                    task: body.task,
                    completed: body.completed || false,
                };

                await dynamoDb.send(new PutCommand({
                    TableName: process.env.TODO_TABLE_NAME,
                    Item: newItem,
                }));

                return {
                    statusCode: 201,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'To-do item created', item: newItem }),
                };

            case 'PUT':  // Update a to-do item
                await dynamoDb.send(new UpdateCommand({
                    TableName: process.env.TODO_TABLE_NAME,
                    Key: { id: body.id },
                    UpdateExpression: 'set task = :task, completed = :completed',
                    ExpressionAttributeValues: {
                        ':task': body.task,
                        ':completed': body.completed,
                    },
                }));

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'To-do item updated' }),
                };

            case 'DELETE':  // Delete a to-do item
                await dynamoDb.send(new DeleteCommand({
                    TableName: process.env.TODO_TABLE_NAME,
                    Key: { id: body.id },
                }));

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'To-do item deleted' }),
                };

            case 'GET':  // Retrieve all to-do items
                const data = await dynamoDb.send(new ScanCommand({ TableName: process.env.TODO_TABLE_NAME }));

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ items: data.Items }),
                };
            case 'OPTIONS':  // Handle preflight requests
                return {
                    statusCode: 200,
                    headers: corsHeaders
                };
            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: `Unsupported method ${httpMethod}` }),
                };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};


