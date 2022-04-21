// users
const {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
  currentUser,
  search,
  getFollowers,
  getFollowings,
  deActive,
  deActiveStatus,
  active2f,
  sendSMS,
  verifySMS,
  verifyTokenWeb,
  updatePassword,
  verifySMSFirstTime,
  sendSMSFirstTime,
  subscribeUser,
} = require("../controller/users");
const router = require("express").Router();
const verifyToken = require("../private/privateRoute");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *    BasicAuth:
 *      type: http
 *      scheme: basic
 *    BearerAuth:
 *     type: http
 *     scheme: bearer
 *    ApiKeyAuth:
 *     type: apiKey
 *     in: header
 *   schemas:
 *     New_User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the user
 *         profilePicture:
 *           type: string
 *         personalSite:
 *           type: string
 *         customURL:
 *           type: string
 *         followings:
 *           type: array
 *         followers:
 *           type: array
 *         bio:
 *           type: string
 *         number:
 *           type: string
 *         experience:
 *           type: string
 *         facebook:
 *           type: string
 *         instagram:
 *           type: string
 *         twitter:
 *           type: string
 *         isOnline:
 *           type: boolean
 *         location:
 *           type: object
 *         deactive:
 *           type: boolean
 *         twofactor:
 *           type: boolean
 *         lastOnlineTimestamp:
 *           type: string
 *         pushToken:
 *           type: string
 *         badgeCount:
 *           type: string
 *         bioType:
 *           type: string
 *         followerType:
 *           type: string
 *         postType:
 *           type: string
 *         algorand:
 *           type: boolean
 *         algorandAddress:
 *           type: string
 *         likedNft:
 *           type: array
 *         starredNft:
 *           type: array
 *         cartNFT:
 *           type: array
 *       example:
 *         bio: Hey, I am an independent creator
 */

/**
 * @swagger
 * tags:
 *   name: New_User
 *   description: User related endpoints (crud)
 */

/**
 * @swagger
 * /api/users/updateuser:
 *   put:
 *     summary: Update user
 *     tags: [New_User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/New_User'
 *     responses:
 *      200:
 *        description: Returns user
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/New_User'
 *      404:
 *        description: User not found
 *      500:
 *        description: Some error happened
 */

router.get("/verifytoken", verifyTokenWeb);
router.put("/updateuser", verifyToken, updateUser);
router.put("/updatepassword", verifyToken, updatePassword);
router.get("/singleuser/:id", verifyToken, singleUser);
router.put("/follow", verifyToken, followUser);
router.put("/unfollow", verifyToken, unfollowUser);
router.get("/currentuser", verifyToken, currentUser);
router.get("/timeline/allusers", verifyToken, allUser);
router.get("/search", verifyToken, search);
router.get("/getfollowers/:id", verifyToken, getFollowers);
router.get("/getfollowings/:id", verifyToken, getFollowings);
router.put("/deactive", verifyToken, deActive);
router.get("/deactivestatus", verifyToken, deActiveStatus);
router.put("/twofactor", verifyToken, active2f);
router.post("/sendsms", verifyToken, sendSMS);
router.get("/verifysms/:code", verifyToken, verifySMS);
router.post("/createsandboxnumber", verifyToken, sendSMSFirstTime);
router.get(
  "/verifysandboxnumber/:number/:code",
  verifyToken,
  verifySMSFirstTime
);
router.put("/subscribe", verifyToken, subscribeUser);

module.exports = router;
