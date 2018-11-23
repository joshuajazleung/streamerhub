const express = require('express');
const path = require('path');
const morgan = require('morgan');
const debug = require('debug')('app:server');

const app = express();

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/.*/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
