const router = require("express").Router();
const verifyToken = require("../private/privateRoute");
const {
  register,
  login,
  verifyMAIL,
  sendMailAgain,
  appleAuth,
  appleAuthWeb,
  googleAuth,
  verifySMSLoggedUser,
  forgotPasswordMail,
  updateForgotPassword,
} = require("../controller/auth");
const User = require("../models/User");

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

const verifyValidMails = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  console.log("email :", email);
  const user = await User.findOne({ email: email });
  const isValid = user.isValid;
  console.log("usr :: ", user);
  if (!isValid) {
    const result = {
      status_code: 500,
      status_msg: `Please verify your email first`,
    };
    res.status(500).json(result);
  } else {
    next();
  }
};
router.post("/login", verifyValidMails, login);
router.post("/appleAuth", appleAuth);
router.post("/appleAuthWeb", appleAuthWeb);
router.post("/googleAuth", googleAuth);
router.post("/verifymail", verifyMAIL);
router.post("/verifysmsuser", verifySMSLoggedUser);
router.put("/sendmailagain", sendMailAgain);
router.put("/forgotpasswordmail", forgotPasswordMail);
router.put("/updateforgotpassword", updateForgotPassword);

module.exports = router;
