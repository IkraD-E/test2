const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Введите Email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Введите Пароль'],
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: [true, 'Введите Имя'],
  },
}, { versionKey: false });

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;

  return user;
};

module.exports = mongoose.model('user', userSchema);
