import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import makeEntity from '../src/makeEntity';

let hookValue = null;
let validatedHookValue = null;
let serverHookValue = null;
let component = null;

let useCounter = null;
let useValidatedCounter = null;
let useServerData = null;

const CounterView = () => {
  hookValue = useCounter();
  validatedHookValue = useValidatedCounter();
  serverHookValue = useServerData();

  return null;
};

beforeAll(() => {
  const initialState = {
    value: 0,
    wasReset: false,
    secret: '',
  };

  const isValidCount = update => update.value >= 0;

  const increment = counter => () => {
    counter.setState({ value: counter.state.value + 1 });
  };

  const decrement = counter => () => {
    counter.setState({ value: counter.state.value - 1 });
  };

  const reset = counter => () => {
    counter.setState({ value: 0, wasReset: true });
  };

  const callService = (counter, svc) => () => {
    counter.setState({ secret: svc.getSecret() });
  };

  const hasBeenReset = counter => () => {
    return counter.state.wasReset;
  };

  const service = {
    getSecret: () => '1234',
  };

  const setInvalidProp = counter => () => {
    counter.setState({ value: -1 });
  };

  useCounter = makeEntity(
    {
      initialState,
      increment,
      decrement,
      reset,
      callService,
      hasBeenReset,
      id: 'Counter',
    },
    service
  );

  useValidatedCounter = makeEntity({
    initialState,
    options: { validator: isValidCount },
    setInvalidProp,
  });

  useServerData = makeEntity({
    fetch: serverData => () => {},
  });
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

  it('sets a default of `{}` if initial state is not defined', () => {
    const serverData = serverHookValue[0];
    expect(serverData).toBeInstanceOf(Object);
  });

  it('passes the current state of the entity to actions in the argument object', () => {
    const { hasBeenReset } = hookValue[1];
    const wasReset = hasBeenReset();
    expect(wasReset).toBeDefined();
    expect(wasReset).toBe(false);
  });

  it('passes the `setState` of the entity to actions in the argument object', () => {
    const { reset, hasBeenReset } = hookValue[1];
    act(() => {
      reset();
    });
    const wasReset = hasBeenReset();
    expect(wasReset).toBe(true);
  });

  it('requires each action to be a higher-order function', () => {
    const invalidAction = (counter, value) => {
      counter.setState({ value });
    };
    expect(() => {
      makeEntity({
        initialState: {},
        invalidAction,
      });
    }).toThrow();
  });

  it('discards non-functions apart from `initialState` and `options` in entity spec', () => {
    expect(hookValue[0]).not.toHaveProperty('id');
    expect(hookValue[1]).not.toHaveProperty('id');
  });

  it('allows injecting dependencies into the entity', () => {
    const { callService } = hookValue[1];
    act(() => {
      callService();
    });
    const counter = hookValue[0];
    expect(counter).toHaveProperty('secret', '1234');
  });

  it('validates state updates if a validator function is defined', () => {
    const { setInvalidProp } = validatedHookValue[1];
    expect(() => {
      setInvalidProp();
    }).toThrow();
  });
});
