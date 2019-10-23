const fs = require("fs");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../data/tours.json`));

exports.isValid = (req, res, next) => {
  //console.log("IS_VALID");
  //console.log(req.body);
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "failed",
      message: "No name or price field"
    });
  }
  next();
};

exports.checkId = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid Id"
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  });
};

exports.getTourById = (req, res) => {
  //console.log(req.params);

  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour: tour
    }
  });
};

exports.createTour = (req, res) => {
  //console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;

  //const newTour = Object.assign({ id: newId }, req.body);
  const newTour = { ...req.body, id: newId };

  tours.push(newTour);

  fs.writeFile(`${__dirname}/data/tours.json`, JSON.stringify(tours), err => {
    console.log(err);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour
      }
    });
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour>"
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null
  });
};
