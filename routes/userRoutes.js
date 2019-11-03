const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

/* ROUTES */
const router = express.Router();

router.post("/signup", authController.singup);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/update-password", authController.updatePassword);

router.get(
  "/me",

  userController.getMe,
  userController.getUserById
);
router.patch("/update-me", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
