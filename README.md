# generator-nodecg

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coverage-image]][coverage-url]

> Yeoman generator for [NodeCG](http://nodecg.dev/) bundles

generator-nodecg can be used to quickly start a new bundle with the barebones boilerplate files that every bundle needs.
It can also be used to add a new panel, graphic, or extension in an existing bundle.

## Installation

First, install [Yeoman](http://yeoman.io) and generator-nodecg using [npm](https://www.npmjs.com/)
(we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo@latest
npm install -g generator-nodecg@latest
```

Then generate your new bundle:

```bash
# Run this command inside the directory of your bundle.
# For example, nodecg/bundles/my-bundle.
yo nodecg
```

generator-nodecg also has specific sub-generators that can be used on existing bundles:

```bash
yo nodecg:panel
yo nodecg:graphic
yo nodecg:extension
```

## Special Thanks

Significant portions of this generator are based on [generator-node](https://github.com/yeoman/generator-node).
We thank the developers of [generator-node](https://github.com/yeoman/generator-node) and
[Yeoman](http://yeoman.io/) for their years of hard work.

## License

MIT © [Alex Van Camp](http://alexvan.camp)

[npm-image]: https://badge.fury.io/js/generator-nodecg.svg
[npm-url]: https://npmjs.org/package/generator-nodecg
[travis-image]: https://travis-ci.org/nodecg/generator-nodecg.svg?branch=master
[travis-url]: https://travis-ci.org/nodecg/generator-nodecg
[coverage-image]: https://codecov.io/gh/nodecg/generator-nodecg/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/nodecg/generator-nodecg
