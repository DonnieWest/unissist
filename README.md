<a href="https://www.npmjs.org/package/unissist"><img src="https://img.shields.io/npm/v/unissist.svg?style=flat" alt="npm"></a> <a href="https://travis-ci.org/DonnieWest/unissist"><img src="https://api.travis-ci.org/DonnieWest/unissist.svg?branch=master" alt="travis"></a>

# unissist

> A tiny ~300b unistore persistence helper library state container with various storage adapters.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [License](#license)

## Install

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). Go check them out if you don't have them locally installed.

```sh
npm install --save unissist
```

Then with a module bundler like [webpack](https://webpack.js.org) or [rollup](http://rollupjs.org), use as you would anything else:

```js
// The helper:
import persistStore from 'unissist';

// localStorage Adapter
import localStorageAdapter from 'unissist/integrations/localStorageAdapter';

// indexedDB Adapter
import indexedDBAdapter from 'unissist/integrations/indexdbAdapter';

// AsyncStorage Adapter
import asyncStorageAdapter from 'unissist/integrations/asyncStorageAdapter';
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="//unpkg.com/unistore/dist/unissist.umd.js"></script>
```

You can find the library on `window.unissist`.

### Usage

```js
// use unistore like you always would, but use the unissist helper to persist state
import createStore from 'unistore'
import persistStore from 'unissist'
import localStorageAdapter from 'unissist/integrations/localStorageAdapter';

const store = createStore({ count: 0 })
const adapter = localStorageAdapter();

persistStore(store, adapter);

// store state now includes a `hydrated` that tells you whether or not the state has been rehydrated from the store
```

Unissist also takes a third parameter that allows you to configure how your peristence works

```js
import createStore from 'unistore'
import persistStore from 'unissist'
import localStorageAdapter from 'unissist/integrations/localStorageAdapter';

const store = createStore({ count: 0 })
const adapter = localStorageAdapter();

// Default values except migration
let config = {
  version: 1,
  debounceTime: 100,
  // called when version is updated. Defaults to dropping the store 
  migration: (oldState, oldversion) => ({ /* new state */ }),
  // takes in the current state and returns the state to be persisted
  map: state => ({ /* new persisted state shape */ })
}

persistStore(store, adapter, config);

```

### Reporting Issues

Found a problem? Want a new feature? First of all, see if your issue or idea has [already been reported](../../issues).
If not, just open a [new clear and descriptive issue](../../issues/new).

### Credits

[Jason Miller](https://github.com/developit) for [unistore](https://github.com/developit/unistore), `assign` util function, and a lot of the tooling that I ~stole~ used
</br>
[Jake Archibald](https://github.com/jakearchibald) for [idb-keyval](https://github.com/jakearchibald/idb-keyval) where much of the code for the indexdbAdapter was ~stolen~ borrowed
</br>
[Sean Groff](https://github.com/seangroff) for the name

### License

[MIT License](https://oss.ninja/mit/donniewest) © [Donnie West](https://donniewest.com)
