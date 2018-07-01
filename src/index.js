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
    if (
      !state ||
      (!state.version && conf.migration) ||
      state.version < version
    ) {
      if (conf.migration) {
        Promise.resolve(conf.migration(state, version)).then(function(
          migrated,
        ) {
          store.setState(Object.assign({}, migrated, { hydrated: true }));
        });
      } else {
        store.setState({ hydrated: true, version });
      }
    } else if (conf.hydration) {
      store.setState(
        Object.assign({}, conf.hydration(state), { hydrated: true }),
      );
    } else {
      state.hydrated = true;
      store.setState(state);
    }
  });

  let timer,
    unsubscribe = store.subscribe(function() {
      if (!timer)
        timer = setTimeout(function() {
          let state = store.getState();
          state.version = state.version || version;
          adapter.setState((conf.map || Object)(state));
          timer = null;
        }, conf.debounceTime || 100);
    });

  return function() {
    unsubscribe();
    clearTimeout(timer);
  };
}
