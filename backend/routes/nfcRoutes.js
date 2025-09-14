const express = require("express");
const NfcController = require("../controllers/nfcController");

const router = express.Router();

router.post("/scan", NfcController.scan);

module.exports = router;
