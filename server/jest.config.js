module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    'util/**/*.js',
  ],
};
