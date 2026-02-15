const tmpState = process.env.NODE_ENV;
process.env.NODE_ENV = 'test';
process.env.PREV_NODE_ENV = tmpState;

const { default: globalSetup } = require('./global-setup');
module.exports = async () => {
  await globalSetup();
};
