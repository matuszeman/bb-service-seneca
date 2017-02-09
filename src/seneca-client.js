'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const Joi = require('joi');

/**
 * Seneca client
 */
class SenecaClient {
  /**
   * @param {Seneca} seneca
   */
  constructor(seneca) {
    this.seneca = seneca;
    this.logger = {
      log: function(log) {}
    };
  }

  /**
   * Sets logger
   * @param {Object} logger Logger { log: fn }
   */
  setLogger(logger) {
    Joi.attempt(logger, {
      log: Joi.func().required()
    });
    this.logger = logger;
  }

  /**
   * Calls seneca.act() with action pattern:
   *
   *  - bbservice - serviceName
   *  - bbmethod - method
   *
   * Args object is merged with bbservice/bbmethod seneca pattern object.
   *
   * @param {string} serviceName
   * @param {string} method
   * @param {Object} params
   * @returns {Promise}
   */
  act(serviceName, method, params) {
    Joi.attempt(serviceName, Joi.string().required(), 'Service name must be defined');
    Joi.attempt(method, Joi.string().required(), 'Method must be defined');
    params = Joi.attempt(params, Joi.object().default({}), 'params must be an object');
    return new Promise((resolve, reject) => {
      const args = _.defaults({
        bbservice: serviceName,
        bbmethod: method
      }, params);
      const req = {
        type: 'request',
        ts: new Date().toISOString(),
        service: serviceName,
        method: method,
        params: params
      };
      this.logger.log(req);
      this.seneca.act(args, (err, ret) => {
        if(err) {
          this.logger.log({
            type: 'error',
            ts: new Date().toISOString(),
            service: serviceName,
            method: method,
            error: err,
            request: req
          });
          return reject(err);
        }
        this.logger.log({
          type: 'response',
          ts: new Date().toISOString(),
          service: serviceName,
          method: method,
          response: ret,
          request: req
        });
        resolve(ret);
      });
    });
  }

}

module.exports = SenecaClient;
