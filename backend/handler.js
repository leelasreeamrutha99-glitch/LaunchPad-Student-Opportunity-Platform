const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;
const headers = {"content-type":"application/json","access-control-allow-origin":"*","access-control-allow-headers":"content-type","access-control-allow-methods":"GET,POST,OPTIONS"};
exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return {statusCode:204,headers,body:""};
  try {
    if (event.rawPath === "/health") return {statusCode:200,headers,body:JSON.stringify({status:"ok",service:"launchpad-api"})};
    if (method === "GET") {
      const result = await client.send(new ScanCommand({TableName:TABLE,Limit:100}));
      return {statusCode:200,headers,body:JSON.stringify({items:result.Items||[]})};
    }
    if (method === "POST") {
      const item = JSON.parse(event.body || "{}");
      if (!item.id || !item.name || !item.org) return {statusCode:400,headers,body:JSON.stringify({error:"id, name and org are required"})};
      const safe = {id:String(item.id),name:String(item.name).slice(0,100),org:String(item.org).slice(0,80),type:String(item.type||"Learning").slice(0,30),createdAt:new Date().toISOString()};
      await client.send(new PutCommand({TableName:TABLE,Item:safe,ConditionExpression:"attribute_not_exists(id)")});
      return {statusCode:201,headers,body:JSON.stringify({item:safe})};
    }
    return {statusCode:405,headers,body:JSON.stringify({error:"method not allowed"})};
  } catch (err) {
    console.error("Request failed", {name:err.name,message:err.message});
    const statusCode = err.name === "ConditionalCheckFailedException" ? 409 : 500;
    return {statusCode,headers,body:JSON.stringify({error:statusCode===409?"item already exists":"internal server error"})};
  }
};
