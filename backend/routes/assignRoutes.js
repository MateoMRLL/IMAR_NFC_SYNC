const express = require("express");
const router = express.Router();
const assignController = require("../controllers/assignController");

router.post("/", assignController.assignTag);

module.exports = router;
