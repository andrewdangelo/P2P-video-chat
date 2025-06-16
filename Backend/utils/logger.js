// utils/logger.js
let log = {
  info: (...args) => console.log('[INFO]', ...args),
  success: (...args) => console.log('[SUCCESS]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  room: (...args) => console.log('[ROOM]', ...args),
  media: (...args) => console.log('[MEDIA]', ...args),
  signal: (...args) => console.log('[SIGNAL]', ...args),
  ice: (...args) => console.log('[ICE]', ...args),
};

(async () => {
  try {
    const chalk = (await import('chalk')).default;

    log = {
      info: (...args) => console.log(chalk.cyan('[INFO]'), ...args),
      success: (...args) => console.log(chalk.green('[SUCCESS]'), ...args),
      warn: (...args) => console.warn(chalk.yellow('[WARN]'), ...args),
      error: (...args) => console.error(chalk.red('[ERROR]'), ...args),
      room: (...args) => console.log(chalk.magenta('[ROOM]'), ...args),
      media: (...args) => console.log(chalk.blue('[MEDIA]'), ...args),
      signal: (...args) => console.log(chalk.gray('[SIGNAL]'), ...args),
      ice: (...args) => console.log(chalk.white.bgBlue('[ICE]'), ...args),
    };
  } catch (err) {
    console.warn('[WARN] Failed to load chalk, using fallback logger');
  }
})();

module.exports = new Proxy({}, {
  get: (_, prop) => (...args) => log[prop](...args),
});
