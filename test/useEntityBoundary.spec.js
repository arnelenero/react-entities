import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import useEntityBoundary from '../src/useEntityBoundary';
import makeEntity from '../src/makeEntity';

describe('useEntityBoundary', () => {
  const TestShell = () => {
    useEntityBoundary();

    return <CounterView />;
  };

  const initialState = { value: 0 };
  const increment = counter => () => {
    counter.setState({ value: counter.state.value + 1 });
  };
  const decrement = counter => () => {
    counter.setState({ value: counter.state.value - 1 });
  };
  const useEntityA = makeEntity({ initialState, increment });
  const useEntityB = makeEntity({ initialState, decrement });

  const CounterView = () => {
    hookValueA = useEntityA();
    hookValueB = useEntityB();

    useEffect(() => {
      mountCount++;
    }, []);

    return null;
  };

  let component = null;
  let hookValueA = null;
  let hookValueB = null;
  let mountCount = 0;

  afterEach(() => {
    if (component.exists()) component.unmount();
  });

  it('resets entities to initial state every time the component unmounts', () => {
    component = mount(<TestShell />);

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
