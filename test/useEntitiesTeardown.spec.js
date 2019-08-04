import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import useEntitiesTeardown from '../src/useEntitiesTeardown';
import makeEntity from '../src/makeEntity';

let useEntityA = null;
let useEntityB = null;
let hookValueA = null;
let hookValueB = null;
let component = null;
let mountCount = 0;

const TestShell = () => {
  useEntitiesTeardown();

  return <CounterView />;
};

const CounterView = () => {
  hookValueA = useEntityA();
  hookValueB = useEntityB();

  useEffect(() => {
    mountCount++;
  }, []);

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

  useEntityA = makeEntity({ initialState, increment });
  useEntityB = makeEntity({ initialState, decrement });
});

beforeEach(() => {
  component = mount(<TestShell />);
});

afterEach(() => {
  if (component.exists()) component.unmount();
});

describe('useEntity', () => {
  it('resets entities to initial state every time the component unmounts', () => {
    const prevMountCount = mountCount;
    const { increment } = hookValueA[1];
    const { decrement } = hookValueB[1];

    expect(hookValueA[0]).toHaveProperty('value', 0);
    act(() => {
      increment();
    });
    expect(hookValueA[0]).toHaveProperty('value', 1);

    expect(hookValueB[0]).toHaveProperty('value', 0);
    act(() => {
      decrement();
    });
    expect(hookValueB[0]).toHaveProperty('value', -1);

    component.unmount();

    component = mount(<TestShell />);
    expect(mountCount).toBe(prevMountCount + 1);
    expect(hookValueA[0]).toHaveProperty('value', 0);
    expect(hookValueB[0]).toHaveProperty('value', 0);
  });
});
