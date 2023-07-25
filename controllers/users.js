const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFound = require('../errors/NotFound');
const AuthError = require('../errors/AuthError');
const UserDublication = require('../errors/UserDublication');
const BadRequest = require('../errors/BadRequest');

const opts = {
  new: true,
  runValidators: true,
};

module.exports.createUser = (req, res, next) => {
  bcrypt
    .hash(String(req.body.password), 10)
    .then(
      (hashedPassword) => {
        User
          .create({
            ...req.body,
            password: hashedPassword,
          })
          .then((user) => res.status(201).send({ data: user }))
          .catch((err) => {
            if (err.code === 11000) {
              next(new UserDublication('Пользователь с этой почтой уже зарегестрирован'));
            } else if (err.name === 'ValidationError') {
              next(new BadRequest('Переданы некорректные данные при регистрации'));
            } else {
              next(err);
            }
          });
      },
    )
    .catch((next));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User
    .findOne({ email })
    .select('+password')
    .orFail(() => next(new AuthError('Пользователь не найден')))
    .then((user) => {
      bcrypt.compare(String(password), user.password)
        .then((isValidUser) => {
          if (isValidUser) {
            const token = jwt.sign(
              { _id: user._id },
              NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
              { expiresIn: '7d' },
            );
            res.cookie('jwt', token, {
              maxAge: 360000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
              secure: true,
            });
            res.send({ data: user.toJSON() });
          } else {
            next(new AuthError('Неправильный логин или пароль'));
          }
        });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', 'none', {
    httpOnly: true,
    sameSite: true,
  });
  res.send({ message: 'Вы вышли из аккаунта' });
};

module.exports.getUsers = (req, res, next) => {
  User
    .find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User
    .findById(req.params.userId)
    .orFail(() => next(new NotFound('Пользователь не найден')))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Передан некорректный id'));
      } else {
        next(err);
      }
    });
};

module.exports.getUserMe = (req, res, next) => {
  User
    .findById(req.user._id)
    .orFail(() => next(new NotFound('Пользователь не найден')))
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.updateUserData = (req, res, next) => {
  const userId = req.user._id;
  const newUserEmail = req.body.email;
  const newUserName = req.body.name;
  User
    .find({ email: newUserEmail })
    .then((isEmailTaken) => {
      if (isEmailTaken.length > 1) {
        next(new UserDublication('Пользователь с этой почтой уже зарегестрирован'));
      }
    });
  User
    .findByIdAndUpdate(userId, {
      name: newUserName,
      email: newUserEmail,
    }, opts)
    .orFail(() => next(new NotFound('Пользователь не найден')))
    .select('+password')
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
