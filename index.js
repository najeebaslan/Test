'use strict';
const express = require("express"); 
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const logger = require("./config/logger");
const Uri = require("./config/Database");
const compression = require('compression');
const PORT = process.env.PORT || 3000;

const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

app.use(helmet());
app.use(compression())//===>request يعمل علا ضغط ال 
app.use(morgan('short'));
app.use('/csv', require("./router/card/csv"));
app.use('/user', require("./router/user/user"));
app.use('/user', require("./router/user/sendbalance"));
app.use('/user', require("./router/user/auth"));
app.use('/user', require("./router/user/filter_user"));
app.use('/auth', require("./router/user/auth"));
app.use('/network', require("./router/network/network"));
app.use('/network', require("./router/network/filter_network"));
app.use('/package', require("./router/package"));
app.use('/area', require("./router/coverage"));
app.use('/card', require("./router/card/cards"));
app.use('/offer', require("./router/offers"));
app.use('/filter', require("./router/user/filter_user"));
app.use('/filter', require("./router/network/filter_network"));

app.get("/", (req, res) => {
  res.send("النظام شغال")
});

//app.use(express.static(__dirname + '/public/uploads/'));
app.use(express.static(__dirname + '/public/uploads/'));

global.__basedir = __dirname;
app.all('*', (req, res, next) => {
  res.status(404).json([{
    status: "false",
    Error: 'rout not found !'
  }])
})


app.listen(
  PORT, () => {
  console.log("server is working in PORT " + `${PORT}`);
});



//This is Database Mongodb
mongoose.connect(Uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() => console.log("connected to Database")).
  catch((error) => logger.error("Error no connected to Database" + error));

mongoose.set('useCreateIndex', true)
// git push origin master --force

//1- git add .

//2- git commit -m "My Massag1"

//3- git push -u origin master

//

//https://github.com/najeebaslan/fd.git


