const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const { logger } = require('./logger');

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

const PORT = process.env.WEB_PORT;
const baudRate = parseInt(process.env.BAUD_RATE);
const serialPath = process.env.SERIAL_PORT;

const ipAddresses = process.env.IP_ACL;

const alamosHostname = process.env.FE2_HOSTNAME;
const alamosPort = process.env.FE2_PORT;
const alamosSendData =
  String(process.env.FE2_SEND_DATA).toLowerCase() === 'true';

var statusEmpfang = false;
var atOkay = false;

const port = new SerialPort(
  {
    //binding: MockBinding,
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
  //   if (data.includes('OK') == true) {
  //     if (awaitOk == false) {
  //       console.log('set okay');
  //       atOkay = true;
  //       // port.write('AT+CTSP=1,3,130\r\n');
  //     }
  //   }

  if (data.startsWith('+CTSDSR')) {
    statusEmpfang = true;
  }
  if (statusEmpfang == true) {
    receivedData.push(data);
    readStatus();
  }

  console.log(data);
});

port.write('ATE0\n');
port.write('AT+CTSP=1,3,130\n');

// setInterval(() => {
//   port.write('AT\r\n');
//   atOkay = false;
//   awaitOk();
// }, 10 * 1000);

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

app.get('/send/9', ipAcl, (req, res) => {
  port.write('TEST\r\n');
  port.write('AT+CTSDS=\r\n');
  port.write(
    'AT+CTDCT=Any, [<gateway/repeater address>], [<MNI>], [<serviced GSSI>] ',
  );
  res.status(200).send();
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
