const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const { logger } = require('./helper/logger');
const qs = require('qs');

const { sendTextSDS } = require('./helper');

const express = require('express');
const app = express();

const dateFormat = require('date-format');

const axios = require('axios');
const { MockBinding } = require('@serialport/binding-mock');

MockBinding.createPort('/dev/ROBOT', {
  echo: true,
  record: true,
});

require('dotenv').config();
require('./config');

const PORT = process.env.WEB_PORT;
const baudRate = parseInt(process.env.BAUD_RATE);
const serialPath = process.env.SERIAL_PORT;
const system = process.env.SYSTEM;
const accesskey = process.env.SYSTEM_ACCESSKEY;

const diveraStatusAPI = 'https://app.divera247.com/api/fms';
const diveraLastAlarmAPI = 'https://app.divera247.com/api/last-alarm';

const ipAddresses = process.env.IP_ACL;
const issiWhiteList = process.env.ISSI_WHITELIST;

const alamosHostname = process.env.FE2_HOSTNAME;
const alamosPort = process.env.FE2_PORT;
const statusIssi = process.env.STATUS_ISSI;
const mockEnabled = process.env.MOCK_ENABLED;
const alamosSendData =
  String(process.env.FE2_SEND_DATA).toLowerCase() === 'true';

var statusEmpfang = false;
var atOkay = false;

var routeActive = Boolean('false');

const ctrlZ = Buffer.from([26]);

const port = new SerialPort(
  {
    binding: mockEnabled ? MockBinding : null,
    path: serialPath,
    baudRate: baudRate,
  },
  (err) => {
    if (err) {
      logger.error(err);
    }
  },
);

var receivedData = [];

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
parser.on('data', (data) => {
  if (data.startsWith('+CTSDSR')) {
    statusEmpfang = true;
  }
  if (statusEmpfang == true) {
    receivedData.push(data);
    readStatus();
  }

  console.log(data);
});

port.write('ATE0\r\n');
port.write('AT+CTSP=1,3,130\r\n');

function awaitOk() {
  console.log('AWAITOK', atOkay);
  var counter = 8;
  setInterval(() => {
    counter++;
    if (atOkay == true) {
      // break;
    }
    //console.log('AWAITOK', atOkay);
  }, 1000);
}

async function readStatus() {
  if (receivedData.length == 2) {
    var header = receivedData[0].split(',');
    var statusHex = receivedData[1];
    var sender = header[1].replace('26210010', '');
    var status = 10;
    switch (statusHex) {
      case '8002':
        status = 0;
        break;
      case '8003':
        status = 1;
        break;
      case '8004':
        status = 2;
        break;
      case '8005':
        status = 3;
        break;
      case '8006':
        status = 4;
        break;
      case '8007':
        status = 5;
        break;
      case '8008':
        status = 6;
        break;
      case '8009':
        status = 7;
        break;
      case '800A':
        status = 8;
        break;
      case '800B':
        status = 9;
        break;
      default:
        status = 10;
        break;
    }

    console.log(receivedData[0]);
    var postOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    switch (system) {
      case 'ALAMOS':
        const alamosObj = {
          type: 'STATUS',
          timestamp: `${dateFormat.asString(
            dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT,
            new Date(),
          )}`,
          sender: 'SerialStatus',
          authorization: 'SerialStatus',
          data: {
            status: status,
            address: sender,
          },
        };

        logger.info(alamosObj);

        axios
          .post(
            `https://${alamosHostname}/rest/external/http/status/v2`,
            JSON.stringify(alamosObj),
            postOptions,
          )
          .then((res) => {
            logger.info(`Status für Adresse: ${sender} Status: ${status}`);
            //console.log(res);
          })
          .catch((err) => {
            logger.error(err.response.data.status);
            logger.error(err.response.data.message);
          });
        receivedData = [];
        statusEmpfang = false;
        break;
      case 'DIVERA':
        const response = await axios.get(diveraLastAlarmAPI);
        const lastAlarmData = response.data;

        const SDSMessage = `${lastAlarmData.address} ${lastAlarmData.lat} ${lastAlarmData.lng}`;

        if (['3', '9'].includes(status) && issiWhiteList.includes(sender)) {
          sendTextSDS(port, SDSMessage, sender);
        }
        const data = qs.stringify({
          accesskey: accesskey,
          status: status,
          vehicle_ric: sender,
        });
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };

        axios
          .post(diveraStatusAPI, data, config)
          .then((res) => {
            logger.info(`Status für Adresse: ${sender} Status: ${status}`);
            //console.log(res);
          })
          .catch((err) => {
            logger.error(err.response.data.status);
            logger.error(err.response.data.message);
          });
        logger.info(res);
        break;
      default:
        break;
    }
  }
}

let ipAcl = function (req, res, next) {
  const remoteAddress = req.socket.remoteAddress;
  logger.info(req.socket.remoteAddress);
  if (ipAddresses.includes(remoteAddress)) {
    next();
  } else {
    res.status(401).send();
  }
};

const toAscii = (string) =>
  string
    .split('')
    .map((char) => char.charCodeAt(0))
    .join(' ');

app.get('/activate', ipAcl, (req, res) => {
  routeActive = Boolean('true');
  res.status(200).send();
});

app.get('/send/9', ipAcl, (req, res) => {
  console.log(routeActive);

  if (routeActive == true) {
    const ctrlZ = Buffer.from([26]);
    port.write('AT+CTSP=1,3,130\r\n');
    port.write('AT+CTSDS=13,0\r\n');
    port.write(`AT+CMGS=${statusIssi},16\r\n800B${ctrlZ}`);
    routeActive = false;
    res.status(200).send();
  } else {
    res.status(400).send('error');
  }
});

app.get('/send/sds', ipAcl, (req, res) => {
  sendTextSDS(port, 'VLLSLDSD', '1111111');
  res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server listening on Port ${PORT}`);
});

// port.on('data', (data) => {
//   const statusBody = new StatusModel(
//     'SerialStatus',
//     'SerialStatus',
//     3,
//     'Wache an',
//     1115555,
//     'Merg'
//   );

//   if (alamosSendData == true) {
//     console.log(statusBody);
//   }

//   console.log(`Received data: ${data}`);
// });
