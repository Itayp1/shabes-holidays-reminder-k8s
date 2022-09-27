const moment = require("moment");
const cron = require("node-cron");
const logger = require("elk-logging");
const { getShabesAndHolidaysTimes, sendSmsReminder } = require("./shabesAndHolidaysTimes.js");

let tmpAlertobj = false;

logger("starting cronjob process");
/////////// # ┌────────────── second (optional)
/////////// # │ ┌──────────── minute
/////////// # │ │ ┌────────── hour
/////////// # │ │ │ ┌──────── day of month
/////////// # │ │ │ │ ┌────── month
/////////// # │ │ │ │ │ ┌──── day of week
/////////// # │ │ │ │ │ │
/////////// # │ │ │ │ │ │
/////////// # * * * * * *
const msgReminder = cron.schedule("34 21 * * *", async () => {
  const alertTimeObj = await getShabesAndHolidaysTimes();
  if (!alertTimeObj) {
    logger("no alert to send");
    return;
  } else if (tmpAlertobj) {
    logger(`there is an tmpAlertobj obj do nothing ${JSON.stringify(tmpAlertobj)}`);
    return;
  } else {
    const textCandles = `הדלקת נרות בשעה :${alertTimeObj.time}`;
    const textCandles2 = alertTimeObj.secHoliday ? `הדלקת נרות למחרת בשעה :${alertTimeObj.secHoliday}` : "";
    const havdala = `הבדלה: ${alertTimeObj.havdala}`;
    const msg = `${textCandles} ${textCandles2} ${havdala}`;

    logger(`send sms msg:${msg}`);
    await sendSmsReminder(msg, ["0502838788"]);
    tmpAlertobj = { msg, time: alertTimeObj.time };
  }
});

const beforeShabesReminder = cron.schedule("*/1 * * * *", async () => {
  if (tmpAlertobj) {
    const now = moment(); //now
    const remindertIime = moment(`${now.format("YYYY-MM-DD")}T${tmpAlertobj.time}:00`);
    const timeUntilShabes = remindertIime.diff(now, "minutes");
    if (timeUntilShabes < 20) {
      const ReminderMsg = `תזכורת לכניסת השבת ${tmpAlertobj.msg}`;
      await sendSmsReminder(ReminderMsg, ["0502838788"]);
      logger(`send sms reminder msg:${ReminderMsg}`);
      tmpAlertobj = false;
      return;
    } else {
      logger(`timeUntilShabes:${timeUntilShabes} wait until he will be 30`);
    }
  } else {
    logger(`dosent have any messages in the queue`);
  }
});

module.exports = {
  beforeShabesReminder,
  msgReminder,
};
