const { SerialPort } = require('serialport');
const { StatusModel } = require('./class/StatusModel');

const { MockBinding } = require('@serialport/binding-mock');

MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });

require('dotenv').config();

const baudRate = parseInt(process.env.BAUD_RATE);
const serialPath = process.env.SERIAL_PORT;

const alamosHostname = process.env.FE2_HOSTNAME;
const alamosPort = process.env.FE2_PORT;
const alamosSendData =
  String(process.env.FE2_SEND_DATA).toLowerCase() === 'true';

const port = new SerialPort({
  binding: MockBinding,
  path: serialPath,
  baudRate: baudRate,
});

port.on('open', () => {
  port.port.emitData('pretend data from device');
});

port.on('data', (data) => {
  const statusBody = new StatusModel(
    'SerialStatus',
    'SerialStatus',
    3,
    'Wache an',
    1115555,
    'Merg'
  );

  if (alamosSendData == true) {
    console.log(statusBody);
  }

  console.log(`Received data: ${data}`);
});
