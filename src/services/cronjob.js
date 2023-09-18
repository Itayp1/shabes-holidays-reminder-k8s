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
const msgReminder = cron.schedule(
  "33 13 * * *",
  async () => {
    const alertTimeObj = await getShabesAndHolidaysTimes();
    if (!alertTimeObj) {
      logger("no alert to send");
      return;
    } else {
      const textCandles = `הדלקת נרות בשעה :${alertTimeObj.time}`;
      const havdala = `הבדלה: ${alertTimeObj.havdala}`;
      const msg = `${textCandles} ${havdala}`;

      logger(`send sms msg:${msg}`);

      sendWhatsAppReminder(alertTimeObj.time, alertTimeObj.havdala, "972502838788", "טל פרץ");
      sendWhatsAppReminder(alertTimeObj.time, alertTimeObj.havdala, "972587107691", "איתי פרץ");

      tmpAlertobj = { msg, time: alertTimeObj.time };
    }
  },
  {
    timezone: "Asia/Jerusalem", //set timezone to jerusalem here
  }
);

const priceAlert = cron.schedule(
  // "30 * * * *", //every 10 min
  "*/10 * * * *", //every 10 min

  async () => {
    console.log("start cron startSearchForPriceChanghe");
    await startSearchForPriceChanghe();
  },
  {
    timezone: "Asia/Jerusalem", //set timezone to jerusalem here
  }
);

module.exports = {
  // beforeShabesReminder,
  msgReminder,
  priceAlert,
};
