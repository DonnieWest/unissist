/** Persists a unistore store to disk using a provided adapter
 *  @name persistStore
 *  @param {Object} [store] unistore store to perist
 *  @param {Object} [adapter] adapter to persist state
 *  @param {Object} [config] unistore configuration
 *  @returns {Function} cancel()
 *  @example
 *   let store = createStore();
 *   let adapter = indexedDbAdapter();
 *   persistStore(store, adapter);
 */
export default function persistStore(store, adapter, conf) {
  conf = conf || {};
  let version = conf.version || 1;

  store.setState({ hydrated: false });

  Promise.resolve(adapter.getState()).then(function(state) {
    if (!state || !state.version || state.version < version) {
      if (conf.migration) {
        store.setState(conf.migration(state, version));
      } else {
        store.setState({ hydrated: true, version });
      }
    } else {
      state.hydrated = true;
      store.setState(state);
    }
  });

  let timer,
    unsubscribe = store.subscribe(function() {
      if (!timer)
        timer = setTimeout(function() {
          adapter.setState((conf.map || Object)(store.getState()));
          timer = null;
        }, conf.debounceTime || 100);
    });

  return function() {
    unsubscribe();
    clearTimeout(timer);
  };
}
