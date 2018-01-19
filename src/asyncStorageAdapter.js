import { AsyncStorage } from 'react-native';

export default function asyncStorageAdapter(storeKey) {
  storeKey = storeKey || 'unistorePersist';
  return {
    async getState() {
      let state;
      try {
        state = JSON.parse(await AsyncStorage.getItem(storeKey));
      } catch (e) {
        // Do nothing
      }
      if (state !== null) return state;
      return undefined;
    },
    setState(value) {
      try {
        return AsyncStorage.setItem(storeKey, JSON.stringify(value));
      } catch (e) {
        // Do nothing
      }
    },
    clearState() {
      try {
        return AsyncStorage.removeItem(storeKey);
      } catch (e) {
        // Do nothing
      }
    },
  };
}
