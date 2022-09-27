const router = require("express").Router();

const logger = require("elk-logging");

// router.get("/", async (req, res) => {
//   logger(`Listing all buckets...`);
//    logger(`send response  all buckets...`);

//   return res.send("bucketsList");
// });

router.get("/bucket/:bucketName/exist", async (req, res) => {
  const { bucketName } = req.params;
  logger(`check if bucket exist`);
  logger(`send response `);

  return res.send({ status: "ok" });
});

module.exports = router;
