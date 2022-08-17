const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    // Variables
    let table = 'DiaxIotDBKey'
    let inputLocation = 'diax'
    let outputLocation = 'diaxHours'
    let startDate = new Date()
    let endDate = new Date()
    // Set to 1 hour ago
    startDate.setHours(startDate.getHours() - 1);
    endDate.setHours(endDate.getHours() - 1);
    // Set start mins, secs, mills to 0
    startDate.setUTCMinutes(0, 0, 0)
    startDate = startDate.getTime()
    // Max out end mins, secs, mills
    endDate.setUTCMinutes(59, 59, 999);
    endDate = endDate.getTime()
    let queryParams = {
        TableName: table,
        KeyConditionExpression: "#location = :locationId and #sample_time BETWEEN :sample_start_timeId AND :sample_end_timeId",
        ExpressionAttributeNames: {
            "#location": "location",
            "#sample_time": "sample_time",
        },
        ExpressionAttributeValues: {
            ":sample_start_timeId": startDate,
            ":sample_end_timeId": endDate,
            ":locationId": inputLocation
        }
    }
    try {
        // Get data
        let inputs = await queryItems()
        if (!inputs[0])
            return sendResponse(500, "No Inputs")
        // Sort by date
        inputs.sort(function (a, b) {
            return new Date(a.timeStamp) - new Date(b.timeStamp);
        });
        // Define which vars will be states to slice the data at
        let stateVars = [
            "ML3", // Molde
            "ML1", // Orden
            "MI19", // Material
            "MI18", // Operario
            "ML5", // Lote
        ]
        // Define which variables will be averages
        let avgVars = {
            "MI17": [], // Atemperador
            "MI27": [], // Tolva
            "MF8": [], // Tiempo puerta
            "MF9": [], // Tiempo máquina
            "MF1": [], // Tiempo Inyección
            "MF12": [], // Peso Inyección
            "MF13": [], // Peso Cavidad 1
            "MF14": [], // Peso Cavidad 2
            "MF15": [], // Peso Cavidad 3
            "MF16": [], // Peso Cavidad 4
            "MF17": [], // Peso cavidad 5
            "MF18": [], // Peso cavidad 6
        }
        let plcAvgVars = {
            PLC1: JSON.parse((JSON.stringify(avgVars))),
            PLC2: JSON.parse((JSON.stringify(avgVars))),
            PLC3: JSON.parse((JSON.stringify(avgVars))),
            PLC4: JSON.parse((JSON.stringify(avgVars))),
            PLC5: JSON.parse((JSON.stringify(avgVars))),
            PLC6: JSON.parse((JSON.stringify(avgVars))),
            PLC7: JSON.parse((JSON.stringify(avgVars))),
            PLC8: JSON.parse((JSON.stringify(avgVars))),
            PLC9: JSON.parse((JSON.stringify(avgVars)))
        }
        let outputs = []
        let lastRecord = {}
        // Define last record for loop start
        lastRecord = JSON.parse((JSON.stringify(inputs[0])))
        const plcIds = Object.keys(inputs[0].plcs)
        // Iterate over all inputs to find state changes and print slices
        inputs.forEach((input, i) => {
            // Check if any of the plcs states changes
            let hasNewState = false
            plcIds.forEach(plcId => {
                stateVars.forEach(stateVar => {
                    let _lastState = lastRecord.plcs[plcId].variables[stateVar].value
                    let _currState = input.plcs[plcId].variables[stateVar].value
                    if (_currState != _lastState)
                        hasNewState = true;
                })
            })
            if (hasNewState) {
                plcIds.forEach(plcId => {
                    Object.keys(avgVars).forEach(varId => {
                        // Calculate averages
                        let sum = plcAvgVars[plcId][varId].reduce((partialSum, a) => partialSum + a, 0);
                        let prom = sum / plcAvgVars[plcId][varId].length;
                        prom = Math.round(prom * 100) / 100
                        lastRecord.plcs[plcId].variables[varId].value = prom.toString()
                    })
                })
                // Push new state slice
                outputs.push(lastRecord)
                // Reset avgs
                plcAvgVars = {
                    PLC8: JSON.parse((JSON.stringify(avgVars))),
                    PLC7: JSON.parse((JSON.stringify(avgVars))),
                    PLC9: JSON.parse((JSON.stringify(avgVars))),
                    PLC4: JSON.parse((JSON.stringify(avgVars))),
                    PLC3: JSON.parse((JSON.stringify(avgVars))),
                    PLC6: JSON.parse((JSON.stringify(avgVars))),
                    PLC5: JSON.parse((JSON.stringify(avgVars))),
                    PLC2: JSON.parse((JSON.stringify(avgVars))),
                    PLC1: JSON.parse((JSON.stringify(avgVars)))
                }
            }
            // Add vars to avgs
            plcIds.forEach(plcId => {
                Object.keys(avgVars).forEach(varId => {
                    plcAvgVars[plcId][varId].push(Number(input.plcs[plcId].variables[varId].value))
                })
            })
            // Reset last record
            lastRecord = JSON.parse(JSON.stringify(input))
        })
        // Calculate averages for final slice
        plcIds.forEach(plcId => {
            Object.keys(avgVars).forEach(varId => {
                let sum = plcAvgVars[plcId][varId].reduce((partialSum, a) => partialSum + a, 0);
                let prom = sum / plcAvgVars[plcId][varId].length;
                prom = Math.round(prom * 100) / 100
                lastRecord.plcs[plcId].variables[varId].value = prom.toString()
            })
        })
        // Push final slice
        outputs.push(lastRecord)
        // Post on dynamo all the final slices
        let i = 0;
        do {
            let key = (new Date(outputs[i].timeStamp)).getTime()
            queryParams = {
                TableName: "DiaxIotDBKey",
                Item: {
                    sample_time: key,
                    location: outputLocation,
                    payload: [outputs[i]],
                },
            };
            await docClient.put(queryParams).promise();
            i++;
        } while (i < outputs.length);
        // Return results
        return sendResponse(200, outputs)
    } catch (err) {
        // Return error
        return sendResponse(500, err)
    }
    // Response builder
    function sendResponse(code, message) {
        return {
            statusCode: code,
            body: JSON.stringify(message),
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS"
            }
        };
    }
    // Query dynamo items
    async function queryItems() {
        try {
            let results = [];
            let items;
            do {
                items = await docClient.query(queryParams).promise();
                items.Items.forEach((item) => results.push(item.payload[0]));
                queryParams.ExclusiveStartKey = items.LastEvaluatedKey;
            } while (typeof items.LastEvaluatedKey !== "undefined" && results.length < 200);
            return results;
        } catch (err) {
            return err
        }
    }
}