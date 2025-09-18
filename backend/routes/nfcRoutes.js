const express = require("express");
const NfcController = require("../controllers/nfcController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scan
 *   description: NFC scanning operations (you can't use it to debug)
 */

/**
 * @swagger
 * /api/nfc/scan:
 *   post:
 *     summary: Scan an NFC tag
 *     tags: [Scan]
 *     requestBody:
 *       description: NFC tag scan data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NfcScanInput'
 *     responses:
 *       200:
 *         description: NFC tag scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Scan failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/nfc/logs:
 *   get:
 *     summary: Retrieve NFC scan logs
 *     tags: [Scan]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of logs to return
 *         example: 50
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter logs by user ID
 *       - in: query
 *         name: tag_id
 *         schema:
 *           type: string
 *         description: Filter logs by tag ID
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logs fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       tag_id:
 *                         type: string
 *                         example: "A1B2C3D4"
 *                       user_name:
 *                         type: string
 *                         example: "Matéo"
 *                       scanned_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-18T20:23:27.000Z"
 *       400:
 *         description: Failed to retrieve logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


router.post("/scan", NfcController.scan);
router.get("/logs", NfcController.getLogs);
module.exports = router;
