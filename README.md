# Ease Task Runner Autoprefixer Plugin

This is a plugin for the [Ease task runner](https://github.com/chisel/ease). It uses the [autoprefixer](https://www.npmjs.com/package/autoprefixer) module to vendor prefix CSS files.

# Installation

```
npm install ease-task-autoprefixer --save-dev
```

**easeconfig.js:**
```js
const autoprefixer = require('ease-task-autoprefixer');

module.exports = ease => {

  ease.install('prefix-css', autoprefixer, {});

};
```

# Configuration

This plugin takes a config object similar to [Autoprefixer Options](https://www.npmjs.com/package/autoprefixer#options) while adding the following properties:
  - `dir`: Path to a directory containing all the SASS files, relative to `easeconfig.js`
  - `outDir`: Path to the output directory where the CSS files should be written, relative to `easeconfig.js`
  - `cleanOutDir`: Boolean indicating if the output directory should be emptied first
  - `browserslist`: A path to the `.browserslistrc` file, relative to `easeconfig.js`

> Either `browserslist` or `overrideBrowserslist` must be present.

# Example

**easeconfig.js:**
```js
const autoprefixer = require('ease-task-autoprefixer');

module.exports = ease => {

  ease.install('prefix-css', autoprefixer, {
    dir: 'dist',
    outDir: 'dist',
    browserslist: '.browserslistrc'
  });

  ease.job('prefix-css-files', ['prefix-css']);

};
```

**CLI:**
```
ease prefix-css-files
```
