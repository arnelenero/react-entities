import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import { makeEntity } from '../src/makeEntity';

let hookValue = null;
let component = null;

let useCounter = null;

const CounterView = () => {
  hookValue = useCounter();

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
    wasReset: false,
  };

  function increment() {
    this.setState({ value: this.state.value + 1 });
  }

  function decrement() {
    this.setState({ value: this.state.value - 1 });
  }

  function reset() {
    this.setState({ value: 0, wasReset: true });
  }

  function hasBeenReset() {
    return this.state.wasReset;
  }

  useCounter = makeEntity({ initialState, increment, decrement, reset, hasBeenReset });
});

beforeEach(() => {
  component = mount(<CounterView />);
});

afterEach(() => {
  if (component.exists()) component.unmount();
});

describe('makeEntity', () => {
  it('returns an entity hook function', () => {
    expect(useCounter).toBeInstanceOf(Function);
    expect(hookValue).toBeInstanceOf(Array);
    expect(hookValue).toHaveLength(2);
  });

  it('sets the initial state of the entity', () => {
    const counter = hookValue[0];
    expect(counter).toHaveProperty('value', 0);
  });

  it('binds `this.state` inside action functions to current state of the entity', () => {
    const { hasBeenReset } = hookValue[1];
    const wasReset = hasBeenReset();
    expect(wasReset).toBeDefined();
    expect(wasReset).toBe(false);
  });

  it('binds `this.setState` inside action functions to the state setter function', () => {
    const { reset, hasBeenReset } = hookValue[1];
    act(() => {
      reset();
    });
    const wasReset = hasBeenReset();
    expect(wasReset).toBe(true);
  });
});
