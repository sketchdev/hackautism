const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const router = express.Router();
router.use(cors());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


// set up routes
app.use('/customers', require('./controllers/customers'));

module.exports = app;
