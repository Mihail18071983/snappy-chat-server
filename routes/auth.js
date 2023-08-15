const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  updateUserStatus
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
// router.get("/status/:id", getOnlineStatus);
router.patch("/update-status", updateUserStatus);

module.exports = router;
