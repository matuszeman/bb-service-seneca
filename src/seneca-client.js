'use strict';

const _ = require('lodash');

/**
 * Seneca client
 */
class SenecaClient {
  /**
   * @param {Seneca} seneca
   */
  constructor(seneca) {
    this.seneca = seneca;
  }

  /**
   * Calls seneca.act()
   *
   * @param {string} role
   * @param {string} cmd
   * @param {Object} args
   * @returns {Promise}
   */
  act(role, cmd, args) {
    return new Promise((resolve, reject) => {
      args = _.defaults({
        role: role,
        cmd: cmd
      }, args);
      this.seneca.act(args, (err, ret) => {
        if(err) {
          return reject(err);
        }
        resolve(ret);
      });
    });
  }

}

module.exports = SenecaClient;
