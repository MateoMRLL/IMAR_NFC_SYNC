const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

// Routes CRUD de base
router.post("/", UserController.register); // POST /api/users
router.get("/", UserController.getAllUsers); //GET /api/users
router.get("/:uuid", UserController.getOneUser); //GET /api/users/:uuid
module.exports = router;
