import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import get from 'lodash/get'
import set from 'lodash/set'
import Vue from 'vue'

function getShareDataProvder (vm) {
  let parent = vm.$parent
  while (parent) {
    if (parent.$share) {
      return parent
    }
    parent = parent.$parent
  }
}

export default function (options) {
  return {
    init (vm, $tasks) {
      vm = vm.hasOwnProperty('default') ? vm['default'] : vm
      let share = get(vm, '$options.fd.share')
      if (share) {
        const taskKey = $tasks.created
        vm[taskKey] = vm[taskKey] || []
        vm[taskKey].push(function () {
          share = isFunction(share) ? share.call(vm) : share
          Vue.util.defineReactive(vm, '$share', share)
        })
      }
    },
    enter (vm, $tasks) {
      const provder = getShareDataProvder(vm)
      if (provder) {
        const taskKey = $tasks.beforeDestroy
        vm[taskKey] = vm[taskKey] || []
        return {
          share: provder.$share,
          watch (key, cb) {
            const unwatch = provder.$watch(key, cb)
            vm[taskKey].push(unwatch)
            return unwatch
          }
        }
      }
    },
    each (vm, config, name, out, $tasks) {
      if (out) {
        if (isString(config)) {
          config = {
            path: config
          }
        } else if (isArray(config)) {
          config = {
            path: config[0],
            writeable: true,
            commit: config[1]
          }
        }
        if (config.writeable && !isUndefined(config.commit)) {
          set(out.share, config.path, config.commit)
        }
        out.watch(`$share.${config.path}`, function (value) {
          if (value !== get(vm, name)) {
            set(vm, name, value)
          }
        })
        const taskKey = $tasks.created
        vm[taskKey] = vm[taskKey] || []
        vm[taskKey].push(function () {
          vm.$watch(name, function (value) {
            const shareValue = get(out.share, config.path)
            if (shareValue !== value) {
              if (config.writeable) {
                // 可写属性，把本地属性的修改同步到 share 数据
                set(out.share, config.path, value)
              } else {
                // 只读属性，恢复到 share 中的值
                set(vm, name, shareValue)
                console.error(`share data error: readonly!, value: ${JSON.stringify(value)}, config: {"${name}": ${JSON.stringify(config)}}`)
              }
            }
          })
        })
        return get(out.share, config.path)
      }
    }
  }
}
