const express = require("express");
const TagController = require("../controllers/tagController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags (locally)
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Tags fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Failed to fetch tags
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get("/", TagController.getAllTags);

module.exports = router;
