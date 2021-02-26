import createEntity from './createEntity';
import useUnscopedEntity from './useUnscopedEntity';
import { store } from './store';

export const makeEntity = (definition, deps) => {
  const entity = createEntity(definition, deps);

  // Save reference to this entity for use with useEntityBoundary hook
  store.push(entity);

  return (selector, equalityFn) =>
    useUnscopedEntity(entity, selector, equalityFn);
};

export default makeEntity;
