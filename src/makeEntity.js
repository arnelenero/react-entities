import { store, getNextId } from './store';
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

  Object.keys(actions).forEach(key => {
    if (typeof actions[key] === 'function') {
      entityActions[key] = actions[key].bind(entity);
    }
  });

  return entityActions;
};

export const makeEntity = ({ initialState, ...actions }) => {
  const entityId = getNextId();
  const entity = (store[entityId] = {
    state: initialState || {},
    listeners: [],
  });
  entity.setState = createSetState(entity);
  entity.actions = bindActions(actions, entity);

  return () => useEntity(entityId);
};

export default makeEntity;
