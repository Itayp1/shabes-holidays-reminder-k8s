require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
process.env.ENV = process.env.ENV || "qa";
module.exports = {
  PORT: parseInt(process.env.PORT || 3000),
  SERVICE_NAME: process.env.SERVICE_NAME || "shabes-holidays-reminder",
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_API_URL: process.env.SMS_API_URL || "https://sapi.itnewsletter.co.il/webservices/wssms.asmx?wsdl",
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || "EAAyW0AzZB8ZBsBO0ZBH4djZB7Kc74zfMJDfFqqfZB8ZCqsvqQLqMqGiXDg44ZC3V5vxO0ybrcvZA5SF7o6x1EZCVZC53M6aPZB555j85Wu71xDQFbCyeZBvDr39w8K296blqJlocRYeG2sLyEZCX5ZBJVRrWrm1e2wZAuTXqnxxcSLnGdeZAZByQPhZA4yEpZCu1ZC0aZBpLfzCtJq2JKEHBZBIzHFM74U",
};
