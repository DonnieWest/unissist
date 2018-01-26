/** Perists a unistore store to disk using a provided adapter
 *  @name persistStore
 *  @param {Object} [store] unistore store to perist
 *  @param {Object} [adapter] adapter to persist state
 *  @param {Object} [config] unistore configuration
 *  @returns {Function} cancel()
 *  @example
 *   let store = createStore();
 *   let adapter = indexedDbAdapter();
 *   persistStore(adapter, store);
 */
export default function persistStore(store, adapter, conf) {
  conf = conf || {};
  let version = conf.version || 1,
    debounceTime = conf.debounceTime || 100,
    migration = conf.migration;

  store.setState({ hydrated: false });

  Promise.resolve(adapter.getState()).then(function(state) {
    if (!state || !state.version || state.version < version) {
      if (migration) {
        store.setState(migration(state, version));
      } else {
        store.setState({ hydrated: true, version });
      }
    } else {
      store.setState(
        Object.assign({}, state, {
          hydrated: true,
        }),
      );
    }
  });

  let timer,
    unsubscribe = store.subscribe(function() {
      if (!timer)
        timer = setTimeout(function() {
          adapter.setState(store.getState());
          timer = null;
        }, debounceTime);
    });

  return function() {
    unsubscribe();
    clearTimeout(timer);
  };
}
