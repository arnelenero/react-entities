import React from 'react';
import { mount } from 'enzyme';

import EntityScope from '../src/EntityScope';
import useEntity from '../src/useEntity';
import createEntity from '../src/createEntity';

describe('EntityScope', () => {
  const counter = {
    initialState: { value: 0 },
    increment: entity => (by = 1) => {
      entity.setState({
        value: entity.state.value + by,
      });
    },
  };

  const CounterView = () => {
    hookValue = useEntity('counter');

    return <></>;
  };

  let component = null;
  let hookValue = null;
  let origConsoleError = null;

  beforeAll(() => {
    origConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = origConsoleError;
  });

  afterEach(() => {
    if (component.exists()) component.unmount();
  });

  it('makes the entity available to its component subtree', () => {
    component = mount(
      <EntityScope entities={{ counter }}>
        <div>
          <CounterView />
        </div>
      </EntityScope>
    );

    expect(hookValue).toBeDefined();
  });

  it('also accepts manually created entities in its `entities` prop', () => {
    component = mount(
      <EntityScope entities={{ counter: createEntity(counter) }}>
        <div>
          <CounterView />
        </div>
      </EntityScope>
    );

    expect(hookValue).toBeDefined();
  });

  it('does not allow access to its scoped entities outside of its subtree', () => {
    expect(() => {
      component = mount(
        <div>
          <CounterView />
          <EntityScope entities={{ counter }}>
            <div></div>
          </EntityScope>
        </div>
      );
    }).toThrow();
  });

  it('inherits entities from a parent EntityScope (if any)', () => {
    component = mount(
      <EntityScope entities={{ counter }}>
        <EntityScope entities={{ timer: createEntity({}) }}>
          <CounterView />
        </EntityScope>
      </EntityScope>
    );

    expect(hookValue).toBeDefined();
  });
});
