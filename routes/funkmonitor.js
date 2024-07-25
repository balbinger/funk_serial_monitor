const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('../views/layout', {
    title: 'Startseite',
    body: '<h1>Willkommen!</h1><p>Dies ist die Startseite.</p>',
  });
});

router.get('/table', (req, res) => {
  const data = [
    { value1: 'A1', value2: 'B1', value3: 'C1' },
    { value1: 'A2', value2: 'B2', value3: 'C2' },
    { value1: 'A3', value2: 'B3', value3: 'C3' },
  ];
  res.render('pages/table', {
    title: 'Tabelle',
    data,
  });
});

module.exports = router;
