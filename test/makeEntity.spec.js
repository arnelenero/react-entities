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

  const increment = counter => () => {
    counter.setState({ value: counter.state.value + 1 });
  };

  const decrementBy = (state, by) => {
    return { value: state.value - by };
  };

  const decrement = counter => () => {
    counter.setState(decrementBy, 1);
  };

  const reset = counter => () => {
    counter.setState({ value: counter.initialState.value, wasReset: true });
  };

  const hasBeenReset = counter => () => {
    return counter.state.wasReset;
  };

  const service = {
    getSecret: () => '1234',
  };

  const callService = (counter, svc) => () => {
    counter.setState({ secret: svc.getSecret() });
  };

  const validate = (_, update) => {
    if (update.value < 0) throw new Error('Invalid counter value');
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
    options: { beforeSetState: validate },
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
    const [{ value: oldValue }, { increment }] = hookValue;
    act(() => {
      increment();
    });
    const { value } = hookValue[0];
    expect(value).toBe(oldValue + 1);
  });

  it('supports passing an updater function to `setState`', () => {
    const [{ value: oldValue }, { decrement }] = hookValue;
    act(() => {
      decrement();
    });
    const { value } = hookValue[0];
    expect(value).toBe(oldValue - 1);
  });

  it('passes the `initialState` of the entity to actions in the argument object', () => {
    const { reset } = hookValue[1];
    act(() => {
      reset();
    });
    const { value } = hookValue[0];
    expect(value).toBe(0);
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

  it('runs the `beforeSetState` function (if defined in options) prior to each `setState`', () => {
    const { setInvalidProp } = validatedHookValue[1];
    expect(() => {
      setInvalidProp();
    }).toThrow();
  });
});
