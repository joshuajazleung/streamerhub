import express from 'express';
import path from 'path';
// import createDebug from 'debug';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import historyApiFallback from 'connect-history-api-fallback';
import morgan from 'morgan';
import webpackConfig from '../webpack.config';

// const debug = createDebug('app:server');

const isDevEnv = ['development', 'dev'].includes(process.env.NODE_ENV);
const compiler = webpack(webpackConfig);
const app = express();

app.use(morgan('dev'));

if (isDevEnv) {
    app.use(
        historyApiFallback({
            verbose: false
        })
    );

    app.use(
        webpackDevMiddleware(compiler, {
            noInfo: true,
            publicPath: webpackConfig.output.publicPath,
            hot: true,
            quiet: false,
            lazy: false,
            stats: {
                colors: true
            }
        })
    );

    app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(__dirname));

// app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'assets', 'views'))

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'index.html'));
    // const filepath = path.join(compiler.outputPath, 'index.html');
    // compiler.outputFileSystem.readFile(filepath, (err, result) => {
    //     if (err) {
    //         return next(err);
    //     }
    //     console.log('gaweg')
    //     res.set('content-type', 'text/html');
    //     res.send(result);
    //     res.end();
    // });
});

export default app;
