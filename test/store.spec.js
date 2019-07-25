import { store, getNextId } from '../src/store';

describe('store', () => {
  it('is always defined', () => {
    expect(store).toBeDefined();
  });

  it('is an object', () => {
    expect(store).toBeInstanceOf(Object);
  });
});
