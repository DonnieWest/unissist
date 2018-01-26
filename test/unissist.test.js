import unissist from '../src';
import localStorageAdapter from '../src/localStorageAdapter';
import createStore from 'unistore';

const LocalStorage = require('node-localstorage').LocalStorage;
window.localStorage = new LocalStorage('./scratch');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('unissist', () => {
  let adapter = localStorageAdapter();
  let cancel;

  afterEach(async () => {
    await adapter.clearState();
    cancel();
  });

  it('should be instantiable', () => {
    let store = createStore();
    cancel = unissist(store, adapter);
    cancel();
  });

  it('should persist store state', async () => {
    let store = createStore();
    cancel = unissist(store, adapter, { version: 1, debounceTime: 0 });

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
  });

  it('should restore persisted state', async () => {
    let store = createStore();
    let cancel = unissist(store, adapter, { version: 1, debounceTime: 0 });

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    cancel = unissist(store, adapter, 1, null, 0);

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({ a: 'b' });
  });

  it('should only update once during a debounce period', async () => {
    let store = createStore();
    cancel = unissist(store, adapter, { version: 1, debounceTime: 100 });

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
  });

  it('should drop the state on version change without a migration function', async () => {
    let store = createStore();
    cancel = unissist(store, adapter, { version: 1, debounceTime: 0 });

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    cancel = unissist(store, adapter, { version: 2, debounceTime: 100 });

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({
      hydrated: true,
      version: 2,
    });
  });

  it('should migrate the state on version change with a migration function', async () => {
    let store = createStore();
    cancel = unissist(store, adapter, { version: 1, debounceTime: 0 });

    expect(adapter.getState()).toBeUndefined();
    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });
    cancel();

    store = createStore();
    cancel = unissist(store, adapter, {
      version: 2,
      debounceTime: 0,
      migration: () => ({ a: 'x' }),
    });

    await sleep(100);

    expect(await adapter.getState()).toMatchObject({
      a: 'x',
      hydrated: true,
    });
  });

  it('should manipulate state on save when passed a reducer function', async () => {
    let store = createStore();
    cancel = unissist(store, adapter, {
      version: 1,
      debounceTime: 0,
      map: state => ({
        a: state.a,
      }),
    });

    expect(adapter.getState()).toBeUndefined();

    store.setState({ a: 'b' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });

    store.setState({ b: 'x' });
    await sleep(100);
    expect(await adapter.getState()).toMatchObject({ a: 'b' });

    // Ensure the store state still contains the key we set
    expect(store.getState()).toMatchObject({ a: 'b', b: 'x' });
  });
});
