import createEntity from '../src/createEntity';

describe('createEntity', () => {
  it('returns an entity instance', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    expect(counter).toBeInstanceOf(Object);
  });

  it('sets the entity `state` value to the `initialState` by default', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    expect(counter.state).toHaveProperty('value', 0);
  });

  it('sets the `state` value to `{}` if no `initialState` in definition', () => {
    const counter = createEntity({});
    expect(counter.state).toBeInstanceOf(Object);
  });

  it('includes a `setState` function in the entity', () => {
    const counter = createEntity({});
    expect(counter.setState).toBeInstanceOf(Function);
  });

  it('enables `setState` to set the entity state', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    counter.setState({ value: 1 });
    expect(counter.state).toHaveProperty('value', 1);
  });

  it('enables `setState` to merge changes with current state', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    counter.setState({ updated: true });
    expect(counter.state).toHaveProperty('value', 0);
    expect(counter.state).toHaveProperty('updated', true);
  });

  it('supports passing an updater function to `setState`', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    const increment = (state, by) => {
      return { value: state.value + by };
    };
    counter.setState(increment, 1);
    expect(counter.state).toHaveProperty('value', 1);
  });

  it('supports multiple arguments to the updater function', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    const adjust = (state, upBy, downBy) => {
      return { value: state.value + upBy - downBy };
    };
    counter.setState(adjust, 5, 3);
    expect(counter.state).toHaveProperty('value', 2);
  });

  it('includes the `initialState` prop (if any) in the entity', () => {
    const counter = createEntity({ initialState: { value: 0 } });
    expect(counter).toHaveProperty('initialState');
    expect(counter.initialState).toHaveProperty('value', 0);
  });

  it('includes an `actions` object in the entity to contain action functions', () => {
    const counter = createEntity({
      doSomething: () => () => {},
    });
    expect(counter.actions).toBeInstanceOf(Object);
    expect(counter.actions.doSomething).toBeInstanceOf(Function);
  });

  it('requires each action definition to be a higher-order function', () => {
    expect(() => {
      createEntity({
        increment: (entity, by) => {
          entity.setState({ value: entity.state.value + by });
        },
      });
    }).toThrow();
  });

  it('passes a reference to the entity, including its `state` and `setState` to each action', () => {
    const counter = createEntity({
      initialState: { value: 0 },
      increment: entity => by => {
        entity.setState({ value: entity.state.value + by });
      },
      reset: entity => () => {
        entity.setState(entity.initialState);
      },
    });
    counter.actions.increment(2);
    expect(counter.state).toHaveProperty('value', 2);
  });

  it('includes the `initialState` in the entity reference passed to actions', () => {
    const counter = createEntity({
      initialState: { value: 0 },
      increment: entity => by => {
        entity.setState({ value: entity.state.value + by });
      },
      reset: entity => () => {
        entity.setState(entity.initialState);
      },
    });
    counter.actions.increment(2);
    counter.actions.reset();
    expect(counter.state).toHaveProperty('value', 0);
  });

  it('includes the `actions` in the entity reference passed to actions', () => {
    const counter = createEntity({
      initialState: { value: 0 },
      increment: entity => by => {
        entity.setState({ value: entity.state.value + by });
      },
      up: entity => () => {
        entity.actions.increment(1);
      },
    });
    counter.actions.up();
    expect(counter.state).toHaveProperty('value', 1);
  });

  it('discards non-functions apart from `initialState` and `options` in entity definition', () => {
    const counter = createEntity({ extraProp: true });
    expect(counter).not.toHaveProperty('extraProp');
  });

  it('allows injecting dependencies into the entity', () => {
    let cachedValue = 0;
    const cacheService = {
      save: value => {
        cachedValue = value;
      },
    };
    const counter = createEntity(
      {
        initialState: { value: 0 },
        increment: (entity, service) => by => {
          entity.setState({ value: entity.state.value + by });
          service.save(entity.state.value);
        },
      },
      cacheService
    );
    counter.actions.increment(5);
    expect(cachedValue).toBe(5);
  });

  it('runs the `beforeSetState` function (if defined in options) prior to each `setState`', () => {
    const counter = createEntity({
      options: {
        beforeSetState: (_, update) => {
          if (update.value < 0) throw new Error('Invalid counter value');
        },
      },
    });
    expect(() => {
      counter.setState({ value: -1 });
    }).toThrow();
  });
});
