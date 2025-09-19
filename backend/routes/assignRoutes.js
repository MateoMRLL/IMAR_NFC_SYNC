const express = require("express");
const router = express.Router();
const assignController = require("../controllers/assignController");

/**
 * @swagger
 * tags:
 *   name: Assign
 *   description: Tag assignment operations
 */

/**
 * @swagger
 * /api/assign:
 *   post:
 *     summary: Assign tag to user
 *     tags: [Assign]
 *     requestBody:
 *       description: Tag assignment data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTagInput'
 *     responses:
 *       200:
 *         description: Tag assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Tag assignment failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post("/", assignController.assignTag);
router.post("/check", assignController.checkAssignment);

module.exports = router;
