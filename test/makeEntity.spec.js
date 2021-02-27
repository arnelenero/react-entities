import React from 'react';
import { mount } from 'enzyme';

import makeEntity from '../src/makeEntity';

describe('makeEntity', () => {
  const useCounter = makeEntity({
    initialState: { value: 0 },
    increment: entity => by => {
      entity.setState({ value: entity.state.value + by });
    },
  });

  let component = null;
  let hookValue = null;

  afterEach(() => {
    if (component.exists()) component.unmount();
  });

  it('returns an entity hook function that returns the tuple [state, actions]', () => {
    const CounterView = () => {
      hookValue = useCounter();
      return <></>;
    };
    component = mount(<CounterView />);

    expect(useCounter).toBeInstanceOf(Function);
    expect(hookValue).toBeInstanceOf(Array);
    expect(hookValue).toHaveLength(2);
    expect(hookValue[0]).toBeInstanceOf(Object);
    expect(hookValue[0]).toHaveProperty('value', 0);
    expect(hookValue[1]).toBeInstanceOf(Object);
    expect(hookValue[1]).toHaveProperty('increment');
    expect(hookValue[1].increment).toBeInstanceOf(Function);
  });
});
