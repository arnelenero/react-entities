import { store, reserveNextEntityId } from './store';
import useEntity from './useEntity';

export const createSetState = entity => {
  return updates => {
    entity.state = { ...entity.state, ...updates };
    for (let i = 0; i < entity.subscribers.length; i++) {
      entity.subscribers[i](entity.state);
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

export const createEntity = (id, initialState, actions, deps) => {
  const entity = (store[id] = {
    state: initialState || {},
    subscribers: [],
    reset: () => {
      entity.state = initialState;
    },
  });
  entity.setState = createSetState(entity);
  entity.actions = bindActions(actions, entity, deps);
};

export const makeEntity = ({ initialState, ...actions }, deps) => {
  const id = reserveNextEntityId();
  createEntity(id, initialState, actions, deps);

  return () => useEntity(id);
};

export default makeEntity;
