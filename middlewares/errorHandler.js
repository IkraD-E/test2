const errorHandler = (err, req, res, next) => {
  const errStatus = err.statusCode || 500;
  const errMessage = errStatus ? err.message : 'На сервере произошла ошибка';

  res.status(errStatus).send({ message: errMessage } || '');
  next();
};

module.exports = errorHandler;
