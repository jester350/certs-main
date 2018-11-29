var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var date = require('date-and-time');
var date = require('debug');
var async = require('async');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var certsRouter = require('./routes/certs');
var testRouter = require('./routes/test');

var offset_def = 10;

var routes = require('./routes')

var app = express();

// app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
//app.use('/jquery-ui', express.static(__dirname + '/node_modules/jquery-ui/external/jquery-1.12.1/'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/certs',certsRouter);
app.use('/test',testRouter);
module.exports = app;
