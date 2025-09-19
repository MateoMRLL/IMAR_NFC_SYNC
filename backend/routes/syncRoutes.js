const express = require("express");
const SyncController = require("../controllers/syncController");

const router = express.Router();

router.post("/users", SyncController.syncUsers);


