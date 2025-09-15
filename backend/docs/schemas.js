/**
 * @swagger
 * components:
 *   schemas:
 *     LocalUser:
 *       type: object
 *       required:
 *         - uuid
 *         - name
 *         - email
 *       properties:
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the local user
 *         name:
 *           type: string
 *           description: Name of the user in local database
 *         email:
 *           type: string
 *           description: Email of the local user
 *       example:
 *         uuid: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "JohnDoe"
 *         email: "johndoe@example.com"
 *
 *     CloudUser:
 *       type: object
 *       required:
 *         - uuid
 *         - username
 *         - email
 *       properties:
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the cloud user
 *         username:
 *           type: string
 *           description: Username in cloud service
 *         email:
 *           type: string
 *           description: Email associated with the cloud account
 *       example:
 *         uuid: "abc12345-67de-89fg-01hi-234567ijklmn"
 *         username: "JohnDoeCloud"
 *         email: "johndoe@example.com"
 *
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the user
 *         email:
 *           type: string
 *           description: Email of the user
 *         password:
 *           type: string
 *           description: Password for authentication
 *       example:
 *         name: "JohnDoe"
 *         email: "johndoe@example.com"
 *
 *     Tag:
 *       type: object
 *       required:
 *         - uid
 *       properties:
 *         uid:
 *           type: string
 *           description: Unique identifier of the tag
 *       example:
 *         uid: "A1B2C3D4"
 *
 *     NfcScanInput:
 *       type: object
 *       required:
 *         - nfc_uid
 *       properties:
 *         nfc_uid:
 *           type: string
 *           description: ID of the NFC tag being scanned
 *       example:
 *         nfc_uid: "A1B2C3D4"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always true for successful responses
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           description: Response data
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always false for errors
 *         error:
 *           type: string
 *           description: Error message
 *
 *     SendCodeInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: User name
 *         email:
 *           type: string
 *           description: Email address to send verification code to
 *       example:
 *         name: "JohnDoe"
 *         email: "johndoe@example.com"
 *
 *     VerifyCodeInput:
 *       type: object
 *       required:
 *         - email
 *         - code
 *       properties:
 *         email:
 *           type: string
 *           description: Email address
 *         code:
 *           type: string
 *           description: Verification code
 *       example:
 *         email: "johndoe@example.com"
 *         code: "123456"
 *
 *     ResendCodeInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: Email address to resend verification code to
 *       example:
 *         email: "johndoe@example.com"
 *
 *     AssignTagInput:
 *       type: object
 *       required:
 *         - nfc_uid
 *         - email
 *       properties:
 *         nfc_uid:
 *           type: string
 *           description: UID of the tag to assign
 *         email:
 *           type: string
 *           description: Email of the user to assign the tag to
 *       example:
 *         nfc_uid: "A1B2C3D4"
 *         email: "johndoe@example.com"
 */

module.exports = {};
