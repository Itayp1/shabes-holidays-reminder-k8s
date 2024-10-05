const router = require("express").Router();
const { getShabesAndHolidaysTimes } = require("../services/shabesAndHolidaysTimes");

router.get("/ShabesAndHolidaysTimes", async (req, res) => {
  console.log(`ShabesAndHolidaysTimes`);
  const times = await getShabesAndHolidaysTimes();
  return res.status(200).send(times);
});
module.exports = router;
