const dateFormat = require('date-format');

class StatusModel {
  constructor(sender, status, authorization, event, address) {
    this.timestamp = `${dateFormat.asString(
      dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT,
      new Date()
    )}`;
    (this.sender = sender),
      (this.authorization = authorization),
      (this.data = {
        status: status,
        event: event,
        address: address,
        //radioName: radioName,
        //  location: {
        //  lat: 48.342424,
        //lng: 10.905622,
        //altitute: 490,
        //accuracy: 10,
        //},
      });
  }
}
module.exports = { StatusModel };
