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

router.post("/scan", NfcController.scan);

module.exports = router;
