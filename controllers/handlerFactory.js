const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/APIFeatures");
const AppError = require("./../utils/AppError");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    //new: true - says that in tour it was updated tour
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found", 404));
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    //new: true - says that in tour it was updated tour
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError("No document found", 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    //console.log(req.body);

    /* const newTour = new Tour({});
    newTour.save(); */
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const docs = await query;

    if (!docs) {
      return next(new AppError("No docs found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        docs
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        docs
      }
    });
  });
