const { SerialPort } = require('serialport');
const { ReadLine } = require('@serialport/parser-readline');
const { StatusModel } = require('./class/StatusModel');

const { MockBinding } = require('@serialport/binding-mock');

MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });

require('dotenv').config();

const baudRate = parseInt(process.env.BAUD_RATE);

const port = new SerialPort({
  binding: MockBinding,
  path: process.env.SERIAL_PORT,
  baudRate: baudRate,
});
//const parser = ReadLine();
//port.pipe(parser);

port.on('open', () => {
  port.port.emitData('pretend data from device');
});

port.on('data', (data) => {
  const statusBody = new StatusModel('Leitstelle', 3);
  console.log(statusBody);
  console.log(`Received data: ${data}`);
});
