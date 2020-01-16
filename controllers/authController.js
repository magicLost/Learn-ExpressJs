const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../model/userModel");
const AppError = require("./../utils/AppError");
const sendEmail = require("./../utils/email");

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/* const getToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return undefined;
}; */

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  //if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers("x-forwarded-proto") === "https"
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

exports.singup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createAndSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("No passwor or email", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createAndSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  /* GET TOKEN */
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("You are not logged in.", 401));

  /* VERIFY TOKEN */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  /* CHECK IF USER EXISTS */
  const user = await User.findById(decoded.id);

  if (!user)
    return next(
      new AppError("The user belonging to this token does not exists.")
    );

  /* CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED */
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please login again")
    );
  }

  /* GRANT ACCESS TO PROTECTED ROUTE */
  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  /* res.status(201).json({
    status: "success",
    data: {
      user
    }
  }); */

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a request with your new password and passwordConfirm to: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email"
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      //"There was an error sending the email. Try again later!"
      new AppError(err.message),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //update user
  await user.save();

  //login user
  createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  const { currentPassword, password, passwordConfirm } = req.body;

  if (!user)
    return next(
      new AppError("Some error. Please log in and try again..."),
      401
    );

  // 2 Check if posted password correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Wrong password. Please try again..."), 401);
  }

  // 3 Update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  // 4 Log user in
  createAndSendToken(user, 201, req, res);
});
