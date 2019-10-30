const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 Create error if user post password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /update-password",
        400
      )
    );
  }

  // 2 Update user document
  const filteredBody = filterObj(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.getUserById = (req, res) => {
  res.status(501).json({
    status: "fail",
    message: "Not implemented"
  });
};

exports.createUser = (req, res) => {
  res.status(501).json({
    status: "fail",
    message: "Not implemented"
  });
};

exports.updateUser = (req, res) => {
  res.status(501).json({
    status: "fail",
    message: "Not implemented"
  });
};

exports.deleteUser = (req, res) => {
  res.status(501).json({
    status: "fail",
    message: "Not implemented"
  });
};
