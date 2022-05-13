//import AWS from 'aws-sdk/global'
//import AWSMqttClient from 'aws-mqtt'
const AWSMqttClient = require('aws-mqtt/lib/NodeClient')
const AWS = require('aws-sdk')

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:1e835899-922f-4a23-b61a-f3c5e43d94e7',
});

const client = new AWSMqttClient({
    region: AWS.config.region,
    credentials: AWS.config.credentials,
    endpoint: 'a3ke8mnvd8qmyj-ats.iot.us-east-1.amazonaws.com', // NOTE: See below on how to get the endpoint domain
    expires: 600, // Sign url with expiration of 600 seconds
    clientId: 'mqtt-client-' + (Math.floor((Math.random() * 100000) + 1)), // clientId to register with MQTT broker. Need to be unique per client
    will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
    }
})

client.on('connect', () => {
    console.log('Connected to AWS IoT')
    client.subscribe('diaxPublisher/Messages')
})
client.on('message', (topic, message) => {
    console.log(topic, message)
})
client.on('close', () => {
    console.log('Connection closed')
})
client.on('offline', () => {
    console.log('Connection offline')
})