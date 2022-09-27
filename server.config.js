require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
process.env.ENV = process.env.ENV || "qa";
module.exports = {
  PORT: parseInt(process.env.PORT || 3000),
  SERVICE_NAME: process.env.SERVICE_NAME || "shabes-holidays-reminder",
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_API_URL: process.env.SMS_API_URL || "https://sapi.itnewsletter.co.il/webservices/wssms.asmx?wsdl",
};
