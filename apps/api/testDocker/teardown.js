const { default: globalTeardown } = require('./global-teardown');
module.exports = async () => {
  if (process.env.PREV_NODE_ENV !== 'ci') {
    // 로컬에서는 teardown 하지 않음
    // await globalTeardown();
  }
};
