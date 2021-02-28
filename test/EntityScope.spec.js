import React from 'react';
import { mount } from 'enzyme';

import EntityScope from '../src/EntityScope';
import useEntity from '../src/useEntity';

describe('EntityScope', () => {
  const counter = {
    initialState: { value: 0 },
    increment: (entity, logger) => (by = 1) => {
      entity.setState({
        value: entity.state.value + by,
      });
      if (logger) logger.log();
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

  it('inherits entities from an outer EntityScope (if any)', () => {
    component = mount(
      <EntityScope entities={{ counter }}>
        <EntityScope entities={{ timer: {} }}>
          <CounterView />
        </EntityScope>
      </EntityScope>
    );

    expect(hookValue).toBeDefined();
  });

  it('overrides entities that use the same ID as in an outer EntityScope', () => {
    let outerHookValue = null;
    const OuterView = () => {
      outerHookValue = useEntity('counter');
      return <></>;
    };

    component = mount(
      <EntityScope entities={{ counter }}>
        <OuterView />
        <EntityScope entities={{ counter }}>
          <CounterView />
        </EntityScope>
      </EntityScope>
    );

    hookValue[1].increment();
    expect(hookValue[0]).toHaveProperty('value', 1);
    expect(outerHookValue[0]).toHaveProperty('value', 0);
  });

  it('supports injecting dependencies to entities', () => {
    const silentLogger = {
      log: jest.fn(),
    };
    component = mount(
      <EntityScope entities={{ counter: [counter, silentLogger] }}>
        <div>
          <CounterView />
        </div>
      </EntityScope>
    );

    hookValue[1].increment(1);
    expect(silentLogger.log).toHaveBeenCalled();
  });
});
