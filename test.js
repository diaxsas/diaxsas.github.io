


const request = async () => {
    _res = {
        "name": "Test API",
        "description": "<p>Testing the API.</p>",
        "priority": "2",
        "schedule_date": "2022-04-15 18:00:00",
        "maintenance_type": "corrective",
        "create_uid": "414",
        "equipment_id": "913",
        "maintenance_team_id": "3"
    }
    const response = await fetch("https://api.diax.com.co/createodoomaintenancerequest", {
        method: "POST",
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS"
        },
        body: JSON.stringify(_res)
    });
    
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    console.log(response.status, response.statusText);
    console.log(myJson);
}

request();