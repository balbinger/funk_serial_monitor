const mariadb = require('mariadb');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '192.168.171.252',
  port: '3306',
  database: 'funk_serial_monitor',
  user: 'funk_serial_monitor',
  password: 'E+88YP3-Q3fBVn',
});

const { logger } = require('./logger');

async function getAllRadioData() {
  var conn;
  try {
    connection.connect();
    const res = await connection.query('SELECT * FROM radio_data');
    return res;
  } catch (err) {
    logger.error(err);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getAllRadioData,
};
