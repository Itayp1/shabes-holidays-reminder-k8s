const axios = require("axios");
const conf = require("../../server.config");
const promisify = require("util").promisify;
const soap = require("soap");
const moment = require("moment");
const logger = (msg) => console.log(msg, new Date());
const shavesCalc = require("./shabesCalc");
const hebcalApi = axios.create({
  baseURL: "https://www.hebcal.com",
});
const { WHATSAPP_TOKEN } = require("../../server.config");
const getShabesAndHolidaysTimes = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const inShabat = dayOfWeek === 5 || dayOfWeek === 6;
  const shabbatDate = shavesCalc.getClosestFriday();
  const obj = await shavesCalc.getShabbatTimesForAshkelon(shabbatDate);
  obj.shabbatDate = shabbatDate;
  console.log(obj);
  return obj;
};
function isValidTime(jsonInput) {
  const { date, time, havdala } = jsonInput;

  // Convert date string from 'YYYY:MM:DD' to 'YYYY-MM-DD'
  const formattedDate = date.split(":").join("-");

  // Convert date, time, and havdala to Date objects
  const inputDate = new Date(formattedDate); // Date from JSON
  const inputTime = new Date(`${formattedDate}T${time}`); // Date object for input time
  const havdalaTime = new Date(`${formattedDate}T${havdala}`); // Date object for havdala time
  havdalaTime.setDate(inputDate.getDate() + 1); // Move to the next day

  const now = new Date(); // Current date and time
  const dayAfter = new Date(inputDate); // Date object for the day after
  dayAfter.setDate(inputDate.getDate() + 1); // Move to the next day

  // Check if the current date is the same as the input date or the day after
  const isSameDay = now.toDateString() === inputDate.toDateString();
  const isDayAfter = now.toDateString() === dayAfter.toDateString();

  // If it's the same day, check if the current time is after the input time but before havdala
  if (isSameDay) {
    return now >= inputTime;
  }

  // If it's the day after, check if the current time is before havdala (only)
  if (isDayAfter) {
    return now <= havdalaTime;
  }

  // If it's neither the same day nor the day after, return false
  return false;
}
const sendSmsReminder = async (textMsg, phoneNumbers) => {
  const sendSmsToRecipients = await getSoapClient(conf.SMS_API_URL, "WsSMS.WsSMSSoap.sendSmsToRecipients");
  const request = { ApiKey: conf.SMS_API_KEY, txtOriginator: "IDEV-CLOUD", destinations: phoneNumbers.join(","), txtAddInf: "jsnodetest", txtSMSmessage: textMsg };
  const res = await sendSmsToRecipients(request);

  if (res.sendSmsToRecipientsResult != "1") {
    throw new Error(`the service dident send the sms err:${JSON.stringify(res)}`);
  }
};

async function fetchSunsetTimeForAshkelon(date) {
  const latitude = 31.6689; // Ashkelon's latitude
  const longitude = 34.5669; // Ashkelon's longitude

  // Construct the URL for a free sunset API
  const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`);

  if (!response.ok) {
    throw new Error(`Error fetching sunset time: ${response.statusText}`);
  }

  const data = await response.json();
  return new Date(data.results.sunset); // Assuming the sunset time is returned in ISO format
}

function calculateShabbatTimes(sunsetTime) {
  // Calculate candle lighting time (18 minutes before sunset)
  const candleLighting = new Date(sunsetTime.getTime() - 30 * 60 * 1000); // 18 minutes before sunset

  // Calculate havdalah time (60 minutes after sunset)
  const havdalahTime = new Date(sunsetTime.getTime() + 35 * 60 * 1000); // 60 minutes after sunset

  return {
    candleLighting: candleLighting.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    havdalah: havdalahTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

const sendWhatsAppReminder = async (shabesEntering, havdala, phoneNumbers, name) => {
  try {
    const { data } = await axios.post(`https://graph.facebook.com/v17.0/113481255179838/messages?access_token=${WHATSAPP_TOKEN}`, {
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

    console.log(` send whatsapp message1 ` + JSON.stringify(data));
  } catch (error) {
    console.error(`failes to send whatsapp message ` + error + JSON.stringify(error.response?.data));
  }
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
