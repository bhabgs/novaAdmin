const path = require('path');

module.exports = (options) => ({
  ...options,
  resolve: {
    ...options.resolve,
    alias: {
      '@nova-admin/shared': path.resolve(__dirname, '../../libs/shared/src'),
    },
  },
});
