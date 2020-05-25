import { store, reserveNextEntityId } from './store';
import useEntity from './useEntity';

export const createSetState = entity => {
  return updates => {
    const beforeSetState = entity.options.beforeSetState;
    if (typeof beforeSetState === 'function') beforeSetState(updates);

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

export const createEntity = (id, initialState, actions, deps, options) => {
  const entity = (store[id] = {
    state: initialState || {},
    subscribers: [],
    reset: () => {
      entity.state = initialState;
    },
    options: options || {},
  });
  entity.setState = createSetState(entity);
  entity.actions = bindActions(actions, entity, deps);
};

export const makeEntity = ({ initialState, options, ...actions }, deps) => {
  const id = reserveNextEntityId();
  createEntity(id, initialState, actions, deps, options);

  return selector => useEntity(id, selector);
};

export default makeEntity;
