import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { useEntity } from '../src/useEntity';
import { createEntity } from '../src/makeEntity';

let hookValue = null;
let component = null;
let renderCount = 0;

const Counter = () => {
  hookValue = useEntity('counter');

  useEffect(() => {
    renderCount++;
  });

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
  };

  const actions = {
    increment: function() {
      this.setState({ value: this.state.value + 1 });
    },
    decrement: function() {
      this.setState({ value: this.state.value - 1 });
    },
  };

  createEntity('counter', initialState, actions);
});

beforeEach(() => {
  component = mount(<Counter />);
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
    expect(hookValue[0]).toBeInstanceOf(Object);
    expect(hookValue[0]).toHaveProperty('value');
  });
  it('returns the actions object as the second item', () => {
    expect(hookValue[1]).toBeInstanceOf(Object);
    expect(hookValue[1]).toHaveProperty('increment');
    expect(hookValue[1]).toHaveProperty('decrement');
  });
  it('subscribes the component to changes in entity state caused by an action', () => {
    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    actions.increment();
    setTimeout(() => expect(renderCount).toBe(prevRenderCount + 1));
  });
  it('unsubscribes the component when it unmounts', () => {
    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    component.unmount();
    actions.increment();
    setTimeout(() => expect(renderCount).toBe(prevRenderCount));
  });
});
