const router = require("express").Router();

const {
  register,
  login,
  verifyMAIL,
  sendMailAgain,
  appleAuth,
  verifySMSLoggedUser,
} = require("../controller/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: Password of the author
 *       example:
 *         id: d5fE_asz
 *         email: jack@gmail.com
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Registered user
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */

router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logins user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */

router.post("/login", login);
router.post("/appleAuth", appleAuth);
router.post("/verifymail", verifyMAIL);
router.get("/verifysmsuser/:email/:code", verifySMSLoggedUser);
router.put("/sendmailagain", sendMailAgain);

module.exports = router;
