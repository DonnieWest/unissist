import asyncStorageAdapter from '../src/asyncStorageAdapter';
jest.mock('react-native');

describe('asyncStorageAdapter', () => {
  it('getState() should initially be undefined', async () => {
    const adapter = asyncStorageAdapter();
    expect(await adapter.getState()).toBeUndefined();
  });

  it('setState() should be able to store state and getState() should be able to retrieve stored state', async () => {
    const adapter = asyncStorageAdapter();
    await adapter.setState({ a: 1 });
    expect(await adapter.getState()).toMatchObject({ a: 1 });
  });

  it('getState() should not store undefined keys', async () => {
    const adapter = asyncStorageAdapter();
    await adapter.setState({ a: 1, b: undefined });
    expect(await adapter.getState()).toMatchObject({ a: 1 });
  });

  it('clearState() should reset state to undefined', async () => {
    const adapter = asyncStorageAdapter();
    await adapter.setState({ a: 1 });
    await adapter.clearState();
    expect(await adapter.getState()).toBeUndefined();
  });
});
