//browserify main.js --standalone sdk > bundle.js
const AWSMqttClient = require('aws-mqtt')
const AWS = require('aws-sdk/global')
module.exports = {AWSMqttClient,AWS};