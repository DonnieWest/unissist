import unissist from '../src';
import indexedDbAdapter from '../src/localStorageAdapter';
import createStore from 'unistore';

const LocalStorage = require('node-localstorage').LocalStorage;
window.localStorage = new LocalStorage('./scratch');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('unissist', () => {
  it('should be instantiable', () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store);
    cancel();
  });

  it('should persist store state', async () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store, 1, null, 0);

    expect(adapter.getState()).toBeUndefined();

    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });

    store.setState({ c: 'd' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b', c: 'd' });

    store.setState({ a: 'x' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'x', c: 'd' });

    await adapter.clearState();
    cancel();
  });

  it('should restore persisted state', async () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store, 1, null, 0);

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    adapter = indexedDbAdapter();
    cancel = unissist(adapter, store, 1, null, 0);

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    await adapter.clearState();
    cancel();
  });

  it('should only update once during a debounce period', async () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store, 1, null, 10);

    expect(adapter.getState()).toBeUndefined();

    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });

    store.setState({ c: 'd' });
    expect(await adapter.getState()).toMatchObject({ a: 'b' });

    await sleep(100);

    store.setState({ a: 'x' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'x' });

    await adapter.clearState();
    cancel();
  });

  it('should drop the state on version change without a migration function', async () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store, 1, null, 0);

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    adapter = indexedDbAdapter();
    cancel = unissist(adapter, store, 2, 0);

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({
      hydrated: true,
      version: 2,
    });

    await adapter.clearState();
    cancel();
  });

  it('should migrate the state on version change with a migration function', async () => {
    let store = createStore();
    let adapter = indexedDbAdapter();
    let cancel = unissist(adapter, store, 1, null, 0);

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    adapter = indexedDbAdapter();
    cancel = unissist(adapter, store, 2, () => ({ a: 'x' }), 0);

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({
      a: 'x',
    });

    await adapter.clearState();
    cancel();
  });
});
