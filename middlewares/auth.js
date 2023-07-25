const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  const authorization = req.cookies.jwt;

  if (!authorization) {
    return next(new AuthError('Зайдите в ваш аккаунт'));
  }

  const token = authorization;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return next(new AuthError('Получите новую куку'));
  }
  req.user = payload;

  next();
};

module.exports = auth;
