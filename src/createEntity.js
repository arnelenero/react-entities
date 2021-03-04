export const createSetState = (entity, beforeSetState) => {
  return (updates, ...updaterArgs) => {
    if (typeof updates === 'function')
      updates = updates(entity.state, ...updaterArgs);

    if (typeof beforeSetState === 'function')
      beforeSetState(entity.state, updates);

    entity.state = { ...entity.state, ...updates };

    for (let i = 0; i < entity.subscribers.length; i++) {
      if (typeof entity.subscribers[i] === 'function')
        entity.subscribers[i](entity.state);
    }

    // Cleanup any nullified subscribers due to possible
    // component unmounts caused by this app state change
    entity.subscribers = entity.subscribers.filter(
      item => typeof item === 'function'
    );
  };
};

export const bindActions = (actions, entity, deps) => {
  const entityActions = {};

  for (let key in actions) {
    if (typeof actions[key] === 'function') {
      const action = actions[key](entity, deps);
      if (typeof action !== 'function')
        throw new Error('Action must be defined using higher-order function.');
      entityActions[key] = action;
    }
  }

  return entityActions;
};

export const createEntity = (
  { initialState, options = {}, ...actions },
  deps
) => {
  const entity = {
    state: initialState || {},
    initialState,
    subscribers: [],
    reset: () => {
      entity.state = initialState;
    },
  };
  entity.setState = createSetState(entity, options.beforeSetState);
  entity.actions = bindActions(actions, entity, deps);

  return entity;
};

export default createEntity;
