require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const NotFound = require('./errors/NotFound');
const cors = require('./middlewares/cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./const/limiter');
const router = require('./routes');

// Working port

const { PORT = 3000 } = process.env;

// Database URL

const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : 'mongodb://127.0.0.1:27017/bitfilmsdb';

const app = express();

mongoose
  .connect(BASE_URL)
  .then(() => {
    console.log(`Успешно подключен к серверу: ${BASE_URL}`);
  })
  .catch(() => {
    console.log(`Провалено подключение к серверу: ${BASE_URL}`);
  });

app.use(cors);

app.use(cookieParser());

app.use(helmet());

app.use(express.json());

app.use(requestLogger);

app.use(limiter);

// Server Crash test

// app.get('/crash-test', () => {
//   setTimeout(() => {
//     throw new Error('Сервер сейчас упадёт');
//   }, 0);
// });

app.use('/', router);

app.use((req, res, next) => {
  next(new NotFound('Страница не найдена. Где вы взяли на неё ссылку?'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Слушаем порт: ${PORT}`);
});
