'use strict';

const _ = require('lodash');
const Joi = require('joi');
const bluebird = require('bluebird');
const isGeneratorFn = require('is-generator').fn;
const co = require('co');

/**
 * Seneca factory
 */
class SenecaFactory {
  /**
   * TODO
   *
   * @param {Object} config
   * @param {SenecaClient} senecaClient
   * @returns {Object} Proxy services created
   */
  static createProxyServices(config, senecaClient) {
    const endpoints = {};
    const services  = {};
    _.each(config.endpoints, (opts, name) => {
      opts.pins = [];
      endpoints[name] = opts;
    });

    _.each(config.services, (opts, name) => {
      let endpoint;
      if (_.isString(opts)) {
        endpoint = endpoints[opts];
        opts = {};
      } else {
        endpoint = endpoints[opts.endpoint];
        delete opts.endpoint;
      }

      if (!endpoint) {
        throw new Error('Endpoint does not exist');
      }

      const serviceName = opts.service || name;
      delete opts.service;

      endpoint.pins.push({
        bbservice: serviceName
      });

      services[name] = SenecaFactory.createProxyService(
        serviceName,
        senecaClient,
        opts
      );
    });

    _.each(endpoints, (opts) => {
      senecaClient.seneca.client(opts);
    });

    return services;
  }

  /**
   * Creates local-like service proxying to seneca client
   *
   * If used in environment where Proxy class is not available define `opts.methods` parameter.
   * This creates plain object with methods defined instead of using Proxy.
   *
   * @param {string} serviceName
   * @param {SenecaClient} senecaClient
   * @param {Object} opts
   * @param {Array} [opts.methods] Array of methods to proxy (creates plain object instead of using Proxy)
   * @returns {Object|Proxy}
   */
  static createProxyService(serviceName, senecaClient, opts) {
    opts = Joi.attempt(opts, Joi.object().keys({
      methods: Joi.array().items(Joi.string()).min(1)
    }).default({}));

    if (opts.methods) {
      const obj = {};
      _.each(opts.methods, (method) => {
        obj[method] = function() {
          return senecaClient.act(serviceName, method, arguments[0]);
        }
      });
      return obj;
    }

    const obj = {};
    const handler = {
      get(target, propKey, receiver) {
        return function() {
          return senecaClient.act(serviceName, propKey, arguments[0]);
        }
      }
    };

    return new Proxy(obj, handler);
  }

  /**
   * Creates seneca plugin from the service class instance
   *
   * Exposes each service method with action pattern:
   *
   *  - bbservice - service name
   *  - bbmethod - method name
   *
   * @param {Object} obj Service instance
   * @param {Object} opts
   * @param {Array} opts.methods Service methods to expose
   * @param {string} [opts.service] Service name (default: object's constructor name)
   * @param {string} [opts.pluginName] Seneca plugin name (default: service name)
   * @param {string} [opts.initMethod] Register service method as Seneca initialization action http://senecajs.org/docs/tutorials/how-to-write-a-plugin.html#wp-init
   * @param {Object} [opts.logger] Logger { log: fn }
   * @returns {Function} Seneca plugin
   */
  static createPlugin(obj, opts) {
    opts = Joi.attempt(opts, {
      service: Joi.string().default(obj.constructor.name),
      pluginName: Joi.string(),
      methods: Joi.array().items(Joi.string()).min(1).required(),
      initMethod: Joi.string(),
      logger: Joi.object().keys({
        log: Joi.func().required()
      })
    });
    const service = opts.service;
    const methods = opts.methods;
    let pluginName = service;
    if (opts.pluginName) {
      pluginName = opts.pluginName;
    }

    const logger = opts.logger || { log: function() {} };

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

    const actions = [];
    if (opts.initMethod) {
      actions.push({
        args: {
          init: pluginName
        },
        fn: wrapper(obj, obj.initMethod)
      });
    }

    for (let method of methods) {
      actions.push({
        args: {
          bbservice: service,
          bbmethod: method
        },
        fn: wrapper(obj, obj[method])
      });
    }

    return function() {
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
          return _.endsWith(key, '$') || _.includes(['bbservice', 'bbmethod'], key);
        });
        let func = _.bind(fn, thisArg, params);

        if (isGeneratorFn(fn)) {
          func = co.wrap(func);
        }

        const req = {
          type: 'request',
          ts: new Date().toISOString(),
          service: args.bbservice,
          method: args.bbmethod,
          params: params
        };
        logger.log(req);

        bluebird.try(func).then((ret) => {
          logger.log({
            type: 'response',
            ts: new Date().toISOString(),
            service: args.bbservice,
            method: args.bbmethod,
            response: ret,
            request: req
          });
          done(null, ret);
        }, (err) => {
          logger.log({
            type: 'error',
            ts: new Date().toISOString(),
            service: args.bbservice,
            method: args.bbmethod,
            error: err,
            request: req
          });
          done(err);
        });
      }
    }
  }
}

module.exports = SenecaFactory;
