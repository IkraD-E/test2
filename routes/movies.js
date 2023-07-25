const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { imagePattern, httpPattern } = require('../const/patterns');

const {
  createMovie,
  getMovies,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().min(2).max(30),
    director: Joi.string().required().min(2).max(30),
    duration: Joi.number().required(),
    year: Joi.string().required().min(2).max(4),
    description: Joi.string().required().min(2),
    image: Joi.string().required().pattern(imagePattern),
    trailerLink: Joi.string().required().pattern(httpPattern),
    thumbnail: Joi.string().required().pattern(imagePattern),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
