module.exports = fn => {
  return (req, res, next) => {
    //catch(err => next(err)
    fn(req, res, next).catch(err => next(err));
  };
};
