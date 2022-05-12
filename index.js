const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'ap-south-1'});

exports.handler = async (event, context, callback) => {
    const requestId = context.awsRequestId;
    const msg =  'Hello '+event.queryStringParameters.name+' , your message is ------ '+event.queryStringParameters.msg;
    
    var sns = new AWS.SNS();
    var mailParams = {
            Message: msg, 
            Subject: 'Name = '+event.queryStringParameters.name,
            TopicArn: "arn:aws:sns:ap-south-1:457806762742:mayank-sns"
    };
    await sns.publish(mailParams).promise();
        
    await createMessage(requestId, msg).then(() => {
        callback(null, {
            statusCode: 201,
            body: event.queryStringParameters.name+', you email succesfully sent and message is stored in database also',
            headers: {
                'Access-Control-Allow-Origin' : '*'
            }
        });
    }).catch((err) => {
        console.error(err)
    })
};

function createMessage(requestId, msg) {
    const params = {
        TableName: 'chat-msg',
        Item: {
            'msg_id' : requestId,
            'message' : msg
        }
    }
    return ddb.put(params).promise();
}
