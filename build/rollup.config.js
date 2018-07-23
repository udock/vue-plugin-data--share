module.exports = {
  external: (id) => /^(vue|lodash\/.*)$/.test(id),
  globals: {
    'babel-runtime/core-js/json/stringify': 'core.JSON.stringify',
    'lodash/get': '_.get',
    'lodash/isArray': '_.isArray',
    'lodash/isFunction': '_.isFunction',
    'lodash/isString': '_.isString',
    'lodash/isUndefined': '_.isUndefined',
    'lodash/set': '_.set',
    'vue': 'Vue'
  }
}
