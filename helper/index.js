const ctrlZ = Buffer.from([26]);
const { logger } = require('./logger');

const axios = require('axios');

async function sendTextSDS(port, message, issi) {
  var decodedMessage =
    '8200FF01202020202020202020202020202020202020202020202020';

  //message = await getDiveraAlarmData();
  message = replaceUmlaute(message);
  message = message.substring(0, 85);

  decodedMessage += Buffer.from(message, 'utf8').toString('hex');
  const length = (decodedMessage.length / 2) * 8;

  try {
    port.write(`AT+CTSDS=12,0,0,0,1\r\n`);
    port.write(`AT+CMGS=${issi},${length}\r\n${decodedMessage}${ctrlZ}`);
  } catch (error) {
    return logger.error('Fehler beim Senden der Zieladresse: ', err.message);
  }
}

async function getDiveraAlarmData(accessKey) {
  const response = await axios.get('https://app.divera247.com/api/last-alarm', {
    params: {
      accesskey: accessKey,
    },
  });
  if (response.data.success == true) {
    const lastAlarmData = response.data;
    const address = lastAlarmData.data.address.split(',');

    logger.debug(
      `#MKX=${String(lastAlarmData.data.lng).replace('.', ',')}Y=${String(
        lastAlarmData.data.lat
      ).replace('.', ',')}#${lastAlarmData.data.title}||${
        address[0]
      }||${address[1].trimStart()}||${lastAlarmData.data.text}`
    );
    return `#MKX=${String(lastAlarmData.data.lng).replace('.', ',')}Y=${String(
      lastAlarmData.data.lat
    ).replace('.', ',')}#${lastAlarmData.data.title}||${
      address[0]
    }||${address[1].trimStart()}||${lastAlarmData.data.text}`;
  }
  return '';
}

function replaceUmlaute(text) {
  return text
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
}

module.exports = {
  sendTextSDS,
  getDiveraAlarmData,
};
