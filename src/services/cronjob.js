const moment = require("moment");
const cron = require("node-cron");
const logger = (msg) => console.log(msg, new Date());
const { getShabesAndHolidaysTimes, sendSmsReminder, sendWhatsAppReminder } = require("./shabesAndHolidaysTimes.js");
const { startSearchForPriceChanghe } = require("./yad2Function.js");

logger("starting cronjob process");
// sendWhatsAppReminder("10:00", "10:00", "972587107691", "איתי פרץ")
//   .then((res) => logger("send message"))
//   .catch(console.error);
/////////////////////////////////  ┌────────────── minute
/////////////////////////////////  │  ┌─────────── hour
/////////////////////////////////  │  │  ┌──────── day of month
/////////////////////////////////  │  │  │ ┌────── month
/////////////////////////////////  │  │  │ │ ┌──── day of week
/////////////////////////////////  │  │  │ │ │
/////////////////////////////////  │  │  │ │ │
///////////////////////////////#   *  *  * * *
// sendWhatsAppReminder("10:10", "10:12", "972587107691", "איתי פרץ");
const msgReminder = cron.schedule(
  "35 9 * * 5",
  async () => {
    const alertTimeObj = await getShabesAndHolidaysTimes();
    if (!alertTimeObj) {
      logger("no alert to send");
      return;
    } else {
      const textCandles = `הדלקת נרות בשעה :${alertTimeObj.candleLighting}`;
      const havdala = `הבדלה: ${alertTimeObj.havdalah}`;
      const msg = `${textCandles} ${havdala}`;

      logger(`send sms msg:${msg}`);

      sendWhatsAppReminder(alertTimeObj.candleLighting, alertTimeObj.havdalah, "972502838788", "טל פרץ");
      sendWhatsAppReminder(alertTimeObj.candleLighting, alertTimeObj.havdalah, "972587107691", "איתי פרץ");
      scheduleActionAtTime(alertTimeObj);

      tmpAlertobj = { msg, time: alertTimeObj.candleLighting };
    }
  },
  {
    timezone: "Asia/Jerusalem", //set timezone to jerusalem here
  }
);

const priceAlert = cron.schedule(
  // "30 * * * *", //every 10 min
  "27 9 * * 5", //every 10 min

  async () => {
    console.log("start cron startSearchForPriceChanghe");
    await startSearchForPriceChanghe();
  },
  {
    timezone: "Asia/Jerusalem", //set timezone to jerusalem here
  }
);

function scheduleActionAtTime(alertTimeObj) {
  // Parse the input time
  const [targetHour, targetMinute] = alertTimeObj.candleLighting.split(":").map(Number);

  // Get the current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  // Calculate the target time for today
  const target = new Date();
  target.setHours(targetHour, targetMinute - 10, 0, 0); // Subtract 10 minutes from the target time

  // If the target time is earlier than the current time, assume it is for the next day
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }

  // Calculate the difference in milliseconds
  const timeDifference = target - now;
  // Set a timeout to trigger the action
  setTimeout(() => {
    sendWhatsAppReminder(alertTimeObj.candleLighting, alertTimeObj.havdalah, "972587107691", "איתי פרץ");
    sendWhatsAppReminder(alertTimeObj.candleLighting, alertTimeObj.havdalah, "972502838788", "טל פרץ");
  }, timeDifference);
}

module.exports = {
  // beforeShabesReminder,
  msgReminder,
  priceAlert,
};
