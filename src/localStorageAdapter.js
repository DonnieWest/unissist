export default function localStorageAdapter(storeKey) {
  storeKey = storeKey || 'unistorePersist';
  return {
    getState() {
      let state;
      try {
        state = JSON.parse(localStorage.getItem(storeKey));
      } catch (e) {
        // Do nothing
      }
      if (state !== null) return state;
      return undefined;
    },
    setState(value) {
      try {
        localStorage.setItem(storeKey, JSON.stringify(value));
      } catch (e) {
        // Do nothing
      }
    },
    clearState() {
      try {
        localStorage.removeItem(storeKey);
      } catch (e) {
        // Do nothing
      }
    },
  };
}
