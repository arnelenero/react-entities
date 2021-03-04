import React, { useState, useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import useEntity from '../src/useEntity';
import EntityScope from '../src/EntityScope';
import { shallowEqual } from '../src/utils';

describe('useEntity', () => {
  const counter = {
    initialState: { value: 0, lastUpdated: new Date() },
    increment: entity => (by = 1) => {
      entity.setState({
        value: entity.state.value + by,
        lastUpdated: new Date(),
      });
    },
    touch: entity => () => entity.setState({ lastUpdated: new Date() }),
  };

  const mountContainer = (ChildA, ChildB) => {
    component = mount(
      <EntityScope entities={{ counter }}>
        <ChildA />
        {ChildB && <ChildB />}
      </EntityScope>
    );
  };

  const counterView = (selectKey, equalityFn) => {
    const CounterView = () => {
      const [key, setKey] = useState(selectKey);
      const selector = key
        ? equalityFn === shallowEqual
          ? state => {
              return { [key]: state[key] };
            }
          : state => state[key]
        : undefined;
      setSelectKey = setKey; // Allows modifying the selector key from outside

      hookValue = useEntity('counter', selector, equalityFn);

      useEffect(() => {
        renderCount++;
      });

      return <></>;
    };

    return CounterView;
  };

  const mountCounter = (selectKey, equalityFn) => {
    mountContainer(counterView(selectKey, equalityFn));
  };

  let component = null;
  let renderCount = 0;
  let hookValue = null;
  let setSelectKey = null;

  afterEach(() => {
    if (component.exists()) component.unmount();
  });

  it('returns the tuple [state, actions] of the entity', () => {
    mountCounter();

    expect(hookValue).toBeInstanceOf(Array);
    expect(hookValue).toHaveLength(2);
    expect(hookValue[0]).toBeInstanceOf(Object);
    expect(hookValue[0]).toHaveProperty('value', 0);
    expect(hookValue[1]).toBeInstanceOf(Object);
    expect(hookValue[1]).toHaveProperty('increment');
    expect(hookValue[1].increment).toBeInstanceOf(Function);
  });

  it('re-renders the component on each change in entity state caused by an action', () => {
    mountCounter();

    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    act(() => {
      actions.increment();
    });
    expect(renderCount).toBe(prevRenderCount + 1);
  });

  it('always provides the updated entity state to the component', () => {
    mountCounter();

    const actions = hookValue[1];
    act(() => {
      actions.increment();
    });
    expect(hookValue[0]).toHaveProperty('value', 1);
  });

  it('subscribes the component to changes in only the relevant fields when using selector', () => {
    mountCounter('value');

    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    act(() => {
      actions.touch();
    });
    expect(renderCount).toBe(prevRenderCount);
  });

  it('applies the selector (if any) to the entity state provided to the component', () => {
    mountCounter('value');

    const actions = hookValue[1];
    act(() => {
      actions.increment();
    });
    expect(hookValue[0]).toBe(1);
  });

  it('updates subscription whenever the selector changes', () => {
    mountCounter('value');

    const actions = hookValue[1];
    act(() => {
      actions.increment();
    });
    expect(hookValue[0]).toBe(1);

    act(() => {
      setSelectKey('lastUpdated');
    });
    // hook now uses a different selector
    expect(hookValue[0]).toBeInstanceOf(Date);
  });

  it('supports shallow equality for subcription when using selector', () => {
    mountCounter('value', shallowEqual);

    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    act(() => {
      actions.touch();
    });
    expect(renderCount).toBe(prevRenderCount);
  });

  it('subscribes all components that use the hook', () => {
    let renderCountB = 0;
    let hookValueB = null;
    const CounterB = () => {
      hookValueB = useEntity('counter');
      useEffect(() => {
        renderCountB++;
      });
      return <></>;
    };

    mountContainer(counterView(), CounterB);

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
  });

  it('unsubscribes the component from the entity when it unmounts', () => {
    mountCounter();

    const actions = hookValue[1];
    const prevRenderCount = renderCount;
    component.unmount();
    act(() => {
      actions.increment();
    });
    expect(renderCount).toBe(prevRenderCount);
  });

  it('throws an error if no entity with the specified ID is found within scope', () => {
    const origConsoleError = console.error;
    console.error = jest.fn();

    const BadComponent = () => {
      useEntity('notFound');
    };
    expect(() => {
      mountContainer(BadComponent);
    }).toThrow();

    console.error = origConsoleError;
  });
});
