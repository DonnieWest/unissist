import { assign } from './util';

export default function persistStore(adapter, store, version, debounceTime) {
  version = version || 1;
  debounceTime = debounceTime || 100;
  store.setState({ hydrated: false });

  Promise.resolve(adapter.getState()).then(function(state) {
    if (!state || !state.version || state.version < version) {
      store.setState({ hydrated: true, version });
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
          timer = undefined;
        }, debounceTime);
    });

  return function() {
    unsubscribe();
    clearTimeout(timer);
  };
}
