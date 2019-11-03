const mongoose = require("mongoose");
const slugify = require("slugify");
//const User = require("./userModel");
//const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [50, "A tour name must have less than 10 characters"],
      minlength: [10, "A tour name must have more than 10 characters"]
      //validate: [validator.isAlpha, "Tour name must only contain characters"]
    },
    slug: {
      type: String
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a max group size"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be one of: easy, medium, difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //this.price - do not work on update
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price"
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"]
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a imageCover"]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //do not show this field to output
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //Geo JSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    //this options needs to show our virtual fields
    toJSON: { virtuals: true },
    toObj: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
});

// DOCUMENT MIDDLEWARE - runs before only .save() and .create(), not .insertMany()
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre("save", function(next) {
  console.log("Another pre middleware");
  next();
});

tourSchema.post("save", function(doc, next) {
  console.log(doc);
  next();
});

/* EMBEDING */
/* tourSchema.pre("save", async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

//QUERY MIDDLEWARE - runs for all string that start with find( find, findOne )
tourSchema.pre(/^find/, function(next) {
  //this - Query obj
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took = ${Date.now() - this.start} milliseconds.`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
/* tourSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
}); */

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
