const ctrlZ = Buffer.from([26]);
const { logger } = require('./logger');

function sendTextSDS(port, message, issi) {
  port.write(`AT+CMGS="${issi}"\r`, (err) => {
    if (err) {
      return logger.error('Fehler beim Senden der Zieladresse: ', err.message);
    }
    logger.info('Zieladresse gesendet');

    // Nachrichtentext senden
    port.write(`${message}` + ctrlZ, (err) => {
      if (err) {
        return logger.error('Fehler beim Senden der Nachricht: ', err.message);
      }
      logger.info('Nachricht gesendet');
    });
  });
}

module.exports = {
  sendTextSDS,
};
