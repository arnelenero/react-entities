import { store, reserveNextEntityId } from './store';
import useEntity from './useEntity';

export const createSetState = (entity, beforeSetState) => {
  return updates => {
    if (typeof beforeSetState === 'function')
      beforeSetState(entity.state, updates);

    entity.state = { ...entity.state, ...updates };

    for (let i = 0; i < entity.subscribers.length; i++) {
      if (typeof entity.subscribers[i] === 'function')
        entity.subscribers[i](entity.state);
    }

    // Cleanup any nullified subscribers due to possible
    // component unmounts caused by this app state change
    for (let i = 0; i < entity.subscribers.length; i++) {
      if (typeof entity.subscribers[i] !== 'function')
        entity.subscribers.splice(i, 1);
    }
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
  const id = reserveNextEntityId();
  const entity = (store[id] = {
    state: initialState || {},
    subscribers: [],
    reset: () => {
      entity.state = initialState;
    },
  });
  entity.setState = createSetState(entity, options.beforeSetState);
  entity.actions = bindActions(actions, entity, deps);

  return entity;
};

export const makeEntity = (definition, deps) => {
  const entity = createEntity(definition, deps);

  return (selector, equalityFn) => useEntity(entity, selector, equalityFn);
};

export default makeEntity;
