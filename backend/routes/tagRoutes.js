const express = require("express");
const TagController = require("../controllers/tagController");

const router = express.Router();

router.get("/", TagController.getAllTags);

module.exports = router;
