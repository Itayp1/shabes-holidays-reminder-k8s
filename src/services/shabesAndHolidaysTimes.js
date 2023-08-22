const axios = require("axios");
const conf = require("../../server.config");
const promisify = require("util").promisify;
const soap = require("soap");
const moment = require("moment");
const logger = require("elk-logging");
const hebcalApi = axios.create({
  baseURL: "https://www.hebcal.com",
});

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const getShabesAndHolidaysTimes = async () => {
  const { data } = await hebcalApi.get("/hebcal", {
    params: {
      cfg: "json",
      v: "1",
      start: moment().format("YYYY-MM-DD"),
      end: moment().add(2, "days").format("YYYY-MM-DD"),
      geonameid: "295620",
      b: "30",
      lg: "he",
    },
  });

  const parsedTextToTime = data.items
    .map((obj) => {
      obj.date = moment(obj.date).format("YYYY:MM:DD");
      obj.time = obj.title.split(": ")[1];
      return obj;
    })
    .filter(({ category }) => category === "havdalah" || category === "candles");

  let customIndex = false;
  const today = moment().format("YYYY:MM:DD");
  parsedTextToTime.forEach((obj) => {
    if (!customIndex && obj.category === "candles" && obj.date == today) {
      customIndex = obj;
      return;
    } else if (customIndex && obj.category === "candles") {
      customIndex.secHoliday = obj.title.split(": ")[1];
      return;
    } else if (customIndex && obj.category === "havdalah") {
      customIndex.havdala = obj.time;
      return;
    } else {
      logger(`do nothing customIndex:${customIndex} category:${obj.category}`);
    }
  });

  return customIndex;
};

const sendSmsReminder = async (textMsg, phoneNumbers) => {
  const sendSmsToRecipients = await getSoapClient(conf.SMS_API_URL, "WsSMS.WsSMSSoap.sendSmsToRecipients");
  const request = { ApiKey: conf.SMS_API_KEY, txtOriginator: "IDEV-CLOUD", destinations: phoneNumbers.join(","), txtAddInf: "jsnodetest", txtSMSmessage: textMsg };
  const res = await sendSmsToRecipients(request);

  if (res.sendSmsToRecipientsResult != "1") {
    throw new Error(`the service dident send the sms err:${JSON.stringify(res)}`);
  }
};

const sendWhatsAppReminder = async (shabesEntering, havdala, phoneNumbers, name) => {
  return await axios.post(`https://graph.facebook.com/v17.0/113481255179838/messages?access_token=${WHATSAPP_TOKEN}`, {
    messaging_product: "whatsapp",
    to: phoneNumbers,
    type: "template",
    template: {
      name: "shabea",
      language: {
        code: "he",
        policy: "deterministic",
      },
      components: [
        {
          type: "BODY",
          parameters: [
            {
              type: "text",
              text: `*${name}*`,
            },
            {
              type: "text",
              text: `*${shabesEntering}*`,
            },
            {
              type: "text",
              text: `*${havdala}*`,
            },
          ],
        },
      ],
    },
  });
};

async function getSoapClient(url, methodPath) {
  return new Promise((resolve, reject) => {
    soap.createClient(url, {}, function (err, client) {
      if (err) {
        return reject(err);
      } else {
        if (methodPath) {
          const [mothod1, mothod2, mothod3] = methodPath.split(".");
          return resolve(promisify(client[mothod1][mothod2][mothod3]));
        }
        return resolve(client);
      }
    });
  });
}

module.exports = { getShabesAndHolidaysTimes, sendSmsReminder, sendWhatsAppReminder };
