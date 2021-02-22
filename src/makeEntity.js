import createEntity from './createEntity';
import useUnscopedEntity from './useUnscopedEntity';

export const makeEntity = (definition, deps) => {
  const entity = createEntity(definition, deps);

  return (selector, equalityFn) =>
    useUnscopedEntity(entity, selector, equalityFn);
};

export default makeEntity;
