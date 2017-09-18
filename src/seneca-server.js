const {AbstractService, Joi} = require('@kapitchi/bb-service');
const SenecaFactory = require('./seneca-factory');
const Seneca = require('seneca');
/**
 *
 */
class SenecaServer extends AbstractService {
  /**
   *
   * @param {Object} senecaServerOpts
   * @param {number} senecaServerOpts.port
   * @param {Object} senecaServerOpts.params Seneca params
   * @param {Object} senecaServerExposedServices Services to expose
   *
   * @example
   * const server = new SenecaServer({
   *  port: 8080
   * }, {
   *  myService: {
   *    instance: myServiceImp //service object
   *    methods: ['firstMethod', 'otherMethod']
   *  }
   * })
   */
  constructor(senecaServerOpts, senecaServerExposedServices) {
    super(senecaServerOpts, {
      type: Joi.string().optional().default('http'),
      port: Joi.number(),
      params: Joi.object(),
    });

    this.seneca = new Seneca(senecaServerOpts.params);
    this.exposedServices = senecaServerExposedServices;
  }

  asyncInit() {
    // const logger = {
    //   log: function(entry) {
    //     let msg = [];
    //     if (entry.type === 'response') {
    //       //msg.push(`\n>> ${entry.service}.${entry.method}(${JSON.stringify(entry.request.params)}) =>\n${JSON.stringify(entry.response, null, 2)}`);
    //       msg.push(`>> ${entry.service}.${entry.method}(${JSON.stringify(entry.request.params)})`);
    //       console.log(msg.join(' '));//XXX
    //     }
    //
    //     if (entry.type === 'error') {
    //       msg.push(`\n>> ${entry.service}.${entry.method}(${JSON.stringify(entry.request.params)}) => ${entry.error.name}\n${entry.error.stack}`);
    //       console.log(msg.join(' '));//XXX
    //     }
    //   }
    // };

    for (const serviceName in this.exposedServices) {
      const conf = this.exposedServices[serviceName];
      this.seneca.use({
        init: SenecaFactory.createPlugin(conf.instance, {
          service: serviceName,
          methods: conf.methods,
          //logger
        }),
        name: serviceName
      });
    }

    return new Promise((resolve, reject) => {
      this.seneca.ready((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Start seneca server
   *
   * @returns {Promise.<void>}
   */
  async listen() {
    this.seneca.listen({
      type: this.options.type,
      port: this.options.port
    });
    for (const serviceName in this.exposedServices) {
      const conf = this.exposedServices[serviceName];
      this.logger.log({
        level: 'debug',
        msg: `Exposing service: ${serviceName} - exposing methods: ${conf.methods.join(', ')}`
      });
    }
    this.logger.log({
      level: 'notice',
      msg: `Seneca ${this.options.type} server listening on ${this.options.port}`
    });
  }
}

module.exports = SenecaServer;