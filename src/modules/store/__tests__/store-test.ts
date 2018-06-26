import store from '../store';

describe('store', () => {
  beforeEach(() => {
    store.reset();
  });

  test('returns undefined if key does not exist', () => {
    expect(store.get('foo')).toEqual(undefined);
  });

  test('sets state for a particular key', () => {
    store.set({ foo: 'bar' });
    expect(store.get('foo')).toEqual('bar');
  });

  test('setting state for one property will not affect others', () => {
    store.set({ foo: 'bar' });
    store.set({ baz: 'boo' });
    expect(store.get()).toEqual({ foo: 'bar', baz: 'boo' });
  });

  test('can overwrite a slice of state', () => {
    store.set({ foo: 'bar' });
    expect(store.get('foo')).toEqual('bar');
    store.set({ foo: 'newbar' });
    expect(store.get('foo')).toEqual('newbar');
  });

  test('can reset state', () => {
    store.set({ foo: 'bar' });
    expect(store.get('foo')).toEqual('bar');
    store.reset();
    expect(store.get()).toEqual({});
  });
});
