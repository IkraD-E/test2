const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers,
  getUserById,
  updateUserData,
  getUserMe,
  logout,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getUserMe);

router.delete('/me', logout);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }).unknown(true),
}), updateUserData);

module.exports = router;
