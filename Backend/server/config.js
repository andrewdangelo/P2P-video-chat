require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
};
