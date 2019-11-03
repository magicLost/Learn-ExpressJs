const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

/* MIDDLEWARES */

//Security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: "10kb"
  })
);

// Data sanitization against NoSql query injection
app.use(mongoSanitize()); // Delete mongo operators like $ from data

// Data sanitization against XSS
app.use(xss());

// Remove duplicates parameters in html address query string
app.use(
  hpp({
    whitelist: ["duration"]
  })
);

// Serving static file
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  //console.log("Hello from the middleware..");
  req.requestTime = new Date().toISOString();

  next();
});

/* ROUTE HANDLERS */

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
