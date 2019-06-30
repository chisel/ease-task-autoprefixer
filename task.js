const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const glob = require('glob');

module.exports = (logger, dirname, config) => {

  return () => {

    return new Promise((resolve, reject) => {

      // Validate config
      if ( ! config.dir || ! config.outDir ) return reject(new Error('Autoprefixer plugin misconfiguration! dir and outDir must be present.'));
      if ( ! config.overrideBrowserslist && ! config.browserslist ) return reject(new Error('Autoprefixer plugin misconfiguration! Either browserslist or overrideBrowserslist must be present.'));

      // Empty outDir if necessary
      if ( config.cleanOutDir ) {

        fs.emptyDirSync(path.join(dirname, config.outDir));

      }

      const finalOptions = _.cloneDeep(config);

      delete finalOptions.dir;
      delete finalOptions.outDir;
      delete finalOptions.cleanOutDir;
      delete finalOptions.browserslist;

      // Load browserslist if necessary
      if ( config.browserslist ) {

        try {

          const data = fs.readFileSync(path.join(dirname, config.browserslist), { encoding: 'utf8' }).replace(/\r\n/, '\n').split('\n');

          finalOptions.overrideBrowserslist = [];

          for ( const line of data ) {

            if ( line.trim().substr(0, 1) === '#' ) continue;
            if ( ! line.trim() ) continue;

            finalOptions.overrideBrowserslist.push(line.trim());

          }

        }
        catch (error) {

          return reject(new Error(`Could not read browserslist at "${path.join(dirname, config.browserslist)}"!`));

        }

      }

      const processor = postcss([autoprefixer(finalOptions)]);

      // Search `config.dir` for `.css` files
      glob('**/*.css', { cwd: path.join(dirname, config.dir) }, (error, files) => {

        if ( error ) return reject(error);

        const promises = [];

        logger(`Prefixing ${files.length} files...`);

        for ( const file of files ) {

          promises.push(new Promise((resolve, reject) => {

            // Read file
            fs.readFile(path.join(dirname, config.dir, file), { encoding: 'utf8' }, (error, data) => {

              if ( error ) return reject(error);

              // Prefix CSS
              processor.process(data, { from: path.join(dirname, config.dir, file), to: path.join(dirname, config.outDir, file) })
              .then(result => {

                // Log warnings
                result.warnings().forEach(warn => {

                  logger(`Autoprefixer warning: ${warn.toString()}`);

                });

                // Write to file
                fs.outputFile(path.join(dirname, config.outDir, file), result.css, error => {

                  if ( error ) return reject(error);

                  resolve();

                });

              })
              .catch(reject);

            });

          }));

        }

        Promise.all(promises)
        .then(() => {

          logger(`All ${files.length} files were prefixed.`);
          resolve();

        })
        .catch(error);

      });

    });

  };

};
