const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

const app = express();

/* MIDDLEWARES */

app.use(morgan("dev"));

app.use(express.json());

app.use((req, res, next) => {
  console.log("Hello from the middleware..");
  next();
});

app.use((req, res, next) => {
  //console.log("Hello from the middleware..");
  req.requestTime = new Date().toISOString();
  next();
});

const port = 3000;

/* app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the server side." });
});

app.post("/", (req, res) => {
  res.send("You can post to this endpoint...");
}); */

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours.json`));

/* ROUTE HANDLERS */

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours
    }
  });
};

const getTourById = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid Id"
    });
  }

  res.status(200).json({
    status: "success",
    data: tours.length,
    data: {
      tour: tour
    }
  });
};

const createTour = (req, res) => {
  console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);

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

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid Id"
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour>"
    }
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid Id"
    });
  }

  res.status(204).json({
    status: "success",
    data: null
  });
};

/* ROUTES */

/* app.get("/api/v1/tours", getAllTours);

app.get("/api/v1/tours/:id", getTourById);

app.post("/api/v1/tours", createTour);

app.patch("/api/v1/tours/:id", updateTour);

app.delete("/api/v1/tours/:id", deleteTour); */

app
  .route("/api/v1/tours")
  .get(getAllTours)
  .post(createTour);

app
  .route("/api/v1/tours/:id")
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(port, () => console.log("App running on port " + port));
