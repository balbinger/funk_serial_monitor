const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

for (const key in config) {
  if (config.hasOwnProperty(key)) {
    process.env[key] = config[key];
  }
}
