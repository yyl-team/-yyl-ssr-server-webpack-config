const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const cwd = process.cwd()
module.exports = env => {
  return {
    target: 'node',
    mode: 'none',
    entry: {
      index: path.join(cwd, 'src/server/index.ts')
    },
    output: {
      path: path.join(cwd, 'output/server'),
      filename: '[name].js',
      library: 'app',
      libraryTarget: 'umd',
      libraryExport: 'default'
    },
    context: cwd,
    node: {
      __filename: false,
      __dirname: false
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': cwd,
        '~@': 'src/client/components',
        '~': 'src/client',
        '@server': 'src/server',
        '@client': 'src/client'
      }
    },
    externals: (() => {
      const nodeModules = {}
      fs.readdirSync('node_modules')
        .filter(x => {
          return !['.bin'].includes(x)
        })
        .forEach(name => {
          nodeModules[name] = `commonjs ${name}`
        })
      return nodeModules
    })(),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            context: cwd,
            configFile: 'tsconfig.server.json'
          }
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.(scss|css)/,
          loader: 'ignore-loader'
        },
        {
          test: /\.(png|jpg|gif|webp|ico)$/,
          loader: 'url-loader',
          options: {
            limit: true,
            esModule: false
          }
        }
      ]
    },
    plugins: [
      (() => {
        const r = {}
        Object.keys(env).forEach(key => {
          if (typeof env[key] === 'string') {
            r[`process.env.${key}`] = JSON.stringify(env[key])
          } else {
            r[`process.env.${key}`] = env[key]
          }
        })
        return new webpack.DefinePlugin(r)
      })()
    ]
  }
}
