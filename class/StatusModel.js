class StatusModel {
  constructor(sender, status, event, address, radioName) {
    this.timestamp = Date.now().toString();
    (this.sender = sender),
      (this.data = {
        status: status,
        event: event,
        address: address,
        radioName: radioName,
        location: {
          lat: 48.342424,
          lng: 10.905622,
          altitute: 490,
          accuracy: 10,
        },
      });
  }
}
module.exports = { StatusModel };
