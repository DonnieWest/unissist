import { assign } from './util';

/** Perists a unistore store to disk using a provided adapter
 *  @name persistStore
 *  @param {Object} [adapter] adapter to persist state
 *  @param {Object} [store] unistore store to persist
 *  @param {number} [version=1] optional version of the stored state
 *  @param {Function} [migration] optional migration function that gets called on version upgrade and returns new state
 *  @param {number} [debounceTime=100] optional debounce setState time
 *  @returns {Function} cancel()
 *  @example
 *   let store = createStore();
 *   let adapter = indexedDbAdapter();
 *   persistStore(adapter, store);
 */
export default function persistStore(
  adapter,
  store,
  version,
  migration,
  debounceTime,
) {
  version = version || 1;
  debounceTime = debounceTime || 100;
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
        assign(assign({}, state), {
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
