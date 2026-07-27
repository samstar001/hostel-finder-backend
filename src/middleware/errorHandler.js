// Catches any error passed to next(err) anywhere in the app and
// returns a consistent JSON shape, instead of leaking raw stack
// traces to the client. Must be registered LAST in app.js, after
// all routes — Express identifies error-handling middleware by
// its four-argument signature (err, req, res, next).

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
};

export default errorHandler;