'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const isGeneratorFn = require('is-generator').fn;
const co = require('co');

/**
 * Seneca factory
 */
class SenecaFactory {
  /**
   * Creates local-like service proxying to seneca client
   *
   * @param {string} role
   * @param {SenecaClient} senecaClient
   * @returns {Proxy}
   */
  static createProxyService(role, senecaClient) {
    const obj = {};
    const handler = {
      get(target, propKey, receiver) {
        return function() {
          return senecaClient.act(role, propKey, arguments[0]);
        }
      }
    };

    return new Proxy(obj, handler);
  }

  /**
   * Creates seneca plugin from the service class instance
   *
   * @param {Object} service
   * @param {Object} opts
   * @returns {Function} Seneca plugin
   */
  static createPlugin(service, opts) {
    const pluginName = opts.name || service.constructor.name;
    const role = opts.role || pluginName;
    if (!pluginName || !role) {
      throw new Error('Both name and role needs to be specified');
    }

    let expose = opts.expose;
    //if (!expose) {
    //  expose = [];
    //  //find methods to expose
    //  for (let methodName in service) {
    //    let fn = service[methodName];
    //    if (!_.isFunction(fn) || _.includes(['init', 'mergeOptions'], methodName)) {
    //      continue;
    //    }
    //    expose.push(methodName);
    //  }
    //}

    if (_.isEmpty(expose)) {
      throw new Error('No methods to expose as seneca commands from the service');
    }

    const actions = [];
    if (service.init) {
      actions.push({
        args: {
          init: pluginName
        },
        fn: wrapper(service, service.init)
      });
    }

    for (let method of expose) {
      actions.push({
        args: {
          role: role,
          cmd: method
        },
        fn: wrapper(service, service[method])
      });
    }

    return function(options) {
      const seneca = this;

      for (let action of actions) {
        seneca.add(action.args, action.fn);
      }

      return {
        name: pluginName
      };
    };

    function wrapper(thisArg, fn) {
      return function(args, done) {
        //ignore seneca params
        const params = _.omitBy(args, (val, key) => {
          return _.endsWith(key, '$') || _.includes(['role', 'cmd'], key);
        });
        let func = _.bind(fn, thisArg, params);

        if (isGeneratorFn(fn)) {
          func = co.wrap(func);
        }

        bluebird.try(func).asCallback(done);
      }
    }
  }
}

module.exports = SenecaFactory;
