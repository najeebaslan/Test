const winston = require('winston');
const Uri = require("./Database");
//ppppppp
//ppppppp_pouiy
require('winston-mongodb');
    const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
    new winston.transports.File({
    filename: 'error.log', 
    level: 'error' ,
    format:winston.format.combine(winston.format.timestamp(),winston.format.json())}),

    new winston.transports.MongoDB({
    level: 'error' ,
    db:Uri,
    options: { useUnifiedTopology: true }}),],
  });
  
module.exports=logger;