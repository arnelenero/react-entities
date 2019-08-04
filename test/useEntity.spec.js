import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import makeEntity from '../src/makeEntity';

let useEntity = null;
let hookValue = null;
let component = null;
let renderCount = 0;

const CounterView = () => {
  hookValue = useEntity();

  useEffect(() => {
    renderCount++;
  });

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
  };

  function increment() {
    this.setState({ value: this.state.value + 1 });
  }

  function decrement() {
    this.setState({ value: this.state.value - 1 });
  }

  useEntity = makeEntity({ initialState, increment, decrement });
});

beforeEach(() => {
  component = mount(<CounterView />);
});

afterEach(() => {
  if (component.exists()) component.unmount();
});

describe('useEntity', () => {
  it('returns an array of 2 items', () => {
    expect(hookValue).toBeInstanceOf(Array);
    expect(hookValue).toHaveLength(2);
  });

  it('returns the entity state object as the first item', () => {
    const state = hookValue[0];
    expect(state).toBeInstanceOf(Object);
    expect(state).toHaveProperty('value');
  });

  it('returns the actions object as the second item', () => {
    const actions = hookValue[1];
    expect(actions).toBeInstanceOf(Object);
    expect(actions).toHaveProperty('increment');
    expect(actions.increment).toBeInstanceOf(Function);
    expect(actions).toHaveProperty('decrement');
    expect(actions.decrement).toBeInstanceOf(Function);
  });

  it('subscribes the component to changes in entity state caused by an action', () => {
    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    act(() => {
      actions.increment();
    });
    expect(renderCount).toBe(prevRenderCount + 1);
  });

  it('unsubscribes the component when it unmounts', () => {
    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    component.unmount();
    act(() => {
      actions.increment();
    });
    expect(renderCount).toBe(prevRenderCount);
  });
});
