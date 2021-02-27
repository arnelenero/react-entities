import React, { useState, useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import makeEntity from '../src/makeEntity';
import useEntityBoundary from '../src/useEntityBoundary';
import { shallowEqual } from '../src/utils';

let useEntity = null;
let hookValue = null;
let hookValueB = null;
let component = null;
let componentB = null;
let renderCount = 0;
let renderCountB = 0;
let setKeyFn = null;

const CounterView = () => {
  hookValue = useEntity();

  useEffect(() => {
    renderCount++;
  });

  useEntityBoundary();

  return null;
};

const CounterViewWithSelector = ({ selKey = 'value' }) => {
  hookValueB = useEntity(state => state[selKey]);

  useEffect(() => {
    renderCountB++;
  });

  return null;
};

const CounterContainer = () => {
  const [key, setKey] = useState('value');
  setKeyFn = setKey;

  useEntityBoundary();

  return <CounterViewWithSelector selKey={key} />;
};

const CounterViewWithShallowSelector = () => {
  hookValueB = useEntity(
    ({ value, timesReset }) => ({ value, timesReset }),
    shallowEqual
  );

  useEffect(() => {
    renderCountB++;
  });

  useEntityBoundary();

  return null;
};

const NextCounterView = () => {
  hookValueB = useEntity();

  useEffect(() => {
    renderCountB++;
  });

  useEntityBoundary();

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
    timesReset: 0,
    irrelevant: 'a',
  };

  const increment = counter => () => {
    counter.setState({ value: counter.state.value + 1 });
  };

  const decrement = counter => () => {
    counter.setState({ value: counter.state.value - 1 });
  };

  const setIrrelevant = counter => val => {
    counter.setState({ irrelevant: val });
  };

  useEntity = makeEntity({ initialState, increment, decrement, setIrrelevant });
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

  it('subscribes the component to changes in only the relevant fields when using selector', () => {
    componentB = mount(<CounterContainer />);

    const actions = hookValueB[1];
    const prevRenderCountB = renderCountB;
    act(() => {
      actions.setIrrelevant('b');
    });
    expect(renderCountB).toBe(prevRenderCountB);

    componentB.unmount();
  });

  it('updates subscription whenever the selector changes', () => {
    componentB = mount(<CounterContainer />);

    const actions = hookValueB[1];
    act(() => {
      actions.increment();
    });
    expect(hookValueB[0]).toBe(1);

    act(() => {
      setKeyFn('timesReset');
    });
    // hook now uses different selector
    expect(hookValueB[0]).toBe(0);

    componentB.unmount();
  });

  it('supports shallow equality for subcription when using selector', () => {
    componentB = mount(<CounterViewWithShallowSelector />);

    const actions = hookValueB[1];
    const prevRenderCountB = renderCountB;
    act(() => {
      actions.setIrrelevant('b');
    });
    expect(renderCountB).toBe(prevRenderCountB);

    componentB.unmount();
  });

  it('always provides the updated entity state to the subscribed component', () => {
    const actions = hookValue[1];
    act(() => {
      actions.increment();
    });
    expect(hookValue[0]).toHaveProperty('value', 1);
  });

  it('applies the specified selector (if any) to the entity state returned', () => {
    componentB = mount(<CounterContainer />);

    const actions = hookValueB[1];
    act(() => {
      actions.increment();
    });
    expect(hookValueB[0]).toBe(1);

    componentB.unmount();
  });

  it('subscribes ALL components that use the hook', () => {
    componentB = mount(<NextCounterView />);

    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    const prevRenderCountB = renderCountB;
    act(() => {
      actions.increment();
    });
    expect(renderCount).toBe(prevRenderCount + 1);
    expect(hookValue[0]).toHaveProperty('value', 1);
    expect(renderCountB).toBe(prevRenderCountB + 1);
    expect(hookValueB[0]).toHaveProperty('value', 1);

    componentB.unmount();
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
