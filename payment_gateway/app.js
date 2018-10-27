require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/hello', (req, res) => {
  res.json({
    widgetName: 'Widget01',
    description: 'This is the first widget',
    partNumber: 'WDG0123'
  })
});

app.use('/', router);

module.exports = app;
