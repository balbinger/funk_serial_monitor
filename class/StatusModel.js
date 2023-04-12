class StatusModel{


    constructor ( {sender,  }){
        this.timestamp = Date.now().toString();
        this.sender=sender,
        
    };
    static type = "STATUS";
    "timestamp": "2021-01-28T08:31:28+01:00",
    "sender": "Leitstelle",
    "authorization": "ABC",
    "data": {
        "status": "2",
        "event": "Wache an",
        "address": "1234567",
        "radioName": "LF 40/1",
        "location": {
            "lat": 48.342424,
            "lng": 10.905622,
            "altitute": 490,
            "accuracy": 10
        }
    }
}