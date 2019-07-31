import { store, reserveNextEntityId } from './store';
import useEntity from './useEntity';

export const createSetState = entity => {
  return updates => {
    entity.state = { ...entity.state, ...updates };
    entity.listeners.forEach(listener => {
      listener(entity.state);
    });
  };
};

export const bindActions = (actions, entity) => {
  const entityActions = {};

  for (let key in actions) {
    if (typeof actions[key] === 'function') {
      entityActions[key] = actions[key].bind(entity);
    }
  }

  return entityActions;
};

export const createEntity = (id, initialState, actions) => {
  const entity = (store[id] = {
    state: initialState || {},
    listeners: [],
  });
  entity.setState = createSetState(entity);
  entity.actions = bindActions(actions, entity);
};

export const makeEntity = ({ initialState, ...actions }) => {
  const id = reserveNextEntityId();
  createEntity(id, initialState, actions);

  return () => useEntity(id);
};

export default makeEntity;
