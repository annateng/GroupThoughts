require('dotenv').config();
require('module-alias/register');
const chokidar = require('chokidar');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('express-async-errors');

const { PORT, inProduction } = require('@root/config/common');

const app = express();

// Require is here so we can delete it from cache when files change (*)
app.use('/api', (req, res, next) => require('@root/server')(req, res, next)) // eslint-disable-line

/**
 *  Use "hot loading" in backend
 */
const watcher = chokidar.watch('server'); // Watch server folder
watcher.on('ready', () => {
  watcher.on('all', () => {
    // console.log('clearing server module cache');
    Object.keys(require.cache).forEach((id) => {
      if (id.includes('server')) delete require.cache[id]; // Delete all require caches that point to server folder (*)
    });
    Object.keys(mongoose.models).forEach((model) => {
      delete mongoose.models[model];
    });
    Object.keys(mongoose.modelSchemas).forEach((schema) => {
      delete mongoose.modelSchemas[schema];
    });
  });
});

/**
 * For frontend use hot loading when in development, else serve the static content
 */
if (!inProduction) {
  /* eslint-disable */
  const webpack = require('webpack')
  const middleware = require('webpack-dev-middleware')
  const hotMiddleWare = require('webpack-hot-middleware')
  const webpackConf = require('@root/webpack.config')
  /* eslint-enable */
  const config = webpackConf('development', { mode: 'development' });
  const compiler = webpack(config);

  const devMiddleware = middleware(compiler);
  app.use(devMiddleware);
  app.use(hotMiddleWare(compiler, { publicPath: config.output.publicPath }));
  app.use('*', (req, res, next) => {
    const filename = path.join(compiler.outputPath, 'index.html');
    devMiddleware.waitUntilValid(() => {
      compiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) return next(err);
        res.set('content-type', 'text/html');
        res.send(result);
        return res.end();
      });
    });
  });
} else {
  const DIST_PATH = path.resolve(__dirname, './dist');
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html');

  app.get(/main.js$/, (req, res, next) => {
    req.url = `${req.url}.gz`;
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
  });
  app.get(/7826fb3f944c02e7a282b86aaf1d3849.png$/, (req, res, next) => {
    req.url = `${req.url}.gz`;
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'image/png');
    next();
  });
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => res.sendFile(INDEX_PATH));
}

app.listen(PORT, () => {
  // console.log(`Started on port ${PORT}`);
});
