const express = require("express");
const SyncController = require("../controllers/syncController");

const router = express.Router();

router.post("/users", SyncController.syncUsers);
router.post("/tags", SyncController.syncTags);
router.post("/all", SyncController.syncAll);
module.exports = router;
