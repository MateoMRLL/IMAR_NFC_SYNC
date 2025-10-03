const express = require("express");
const SyncController = require("../controllers/syncController");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Sync
 *   description: Sync method to synchronize cloud and local databases
 */



router.post("/users", SyncController.syncUsers);
router.post("/tags", SyncController.syncTags);


/**
 * @swagger
 * /api/sync/all:
 *   post:
 *     summary: Synchronize users and tags
 *     tags: [Sync]
 *     responses:
 *       200:
 *         description: Sync done successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Sync failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


router.post("/all", SyncController.syncAll);
module.exports = router;
