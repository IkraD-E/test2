const Movie = require('../models/movie');
const MissiedData = require('../errors/MissiedData');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');

module.exports.createMovie = (req, res, next) => {
  const data = {
    ...req.body,
    owner: req.user._id,
  };

  Movie
    .create(data)
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Введены некорректные данные фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.getMovies = (req, res, next) => {
  Movie
    .find({})
    .populate(['owner'])
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie
    .findById(req.params.movieId)
    .orFail(() => next(new NotFound('Фильм не найден')))
    .populate(['owner'])
    .then((movie) => {
      if (!(req.user._id === String(movie.owner._id))) {
        next(new MissiedData('Этот фильм принадлежит другому пользователю'));
      } else {
        Movie.findByIdAndRemove(req.params.movieId)
          .then((deletedMovie) => res.send(deletedMovie))
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректные данные фильма'));
      } else {
        next(err);
      }
    });
};
