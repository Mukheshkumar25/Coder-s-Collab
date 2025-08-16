const express = require("express");

const {
  register,
  login,
  logout,
  getUser,
  execute,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getUser);
router.post("/execute",execute);

module.exports = router;