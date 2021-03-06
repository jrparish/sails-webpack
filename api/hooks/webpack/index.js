const Marlinspike = require('marlinspike');
const webpack = require('webpack');

class Webpack extends Marlinspike {
  constructor (sails) {
    super(sails, module)
  }

  configure () {
    let config = this.sails.config

    if (!config.webpack.options) {
      sails.log.warn('sails-webpack: no Webpack "options" are defined.')
      sails.log.warn('sails-webpack: Please configure config/webpack.js')
    }
  }

  initialize (next) {
    let config = this.sails.config
    next()

    sails.after('lifted', () => {
      this.compiler = webpack(Object.assign({ }, this.sails.config.webpack.options), (err, stats) => {
        if (err) throw err;

        sails.log.info('sails-webpack: compiler loaded.')
        sails.log.silly('sails-webpack: ', stats.toString())

        if (process.env.NODE_ENV == 'development') {
          sails.log.info('sails-webpack: watching...')
          this.compiler.watch(Object.assign({ }, this.sails.config.webpack.watchOptions), (err, rawStats) => this.afterBuild(err, rawStats))
        }
        else {
          sails.log.info('sails-webpack: running...')
          this.compiler.run((err, rawStats) => this.afterBuild(err, rawStats))
        }
      })
    })
  }

  afterBuild (err, rawStats) {
    if (err) return sails.log.error('sails-webpack: FATAL ERROR', err)

    const stats = rawStats.toJson()

    sails.log.debug('sails-webpack: Build Info\n' + rawStats.toString({
      colors: true,
      chunks: false,
      modules: false
    }))

    const { suppressErrors, suppressWarnings } = this.sails.config.webpack;

    if (!suppressErrors && stats.errors.length > 0) {
      sails.log.error('sails-webpack:', stats.errors)
    }
    if (!suppressWarnings && stats.warnings.length > 0) {
      sails.log.warn('sails-webpack:', stats.warnings)
    }
  }
}

module.exports = Marlinspike.createSailsHook(Webpack)
