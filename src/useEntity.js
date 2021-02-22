import { useContext } from 'react';

import EntityContext from './EntityContext';
import useUnscopedEntity from './useUnscopedEntity';

export const useEntity = (entity, selector, equalityFn) => {
  const entities = useContext(EntityContext);

  if (typeof entity !== 'string' || !entities[entity])
    throw new Error(`Invalid entity reference: ${entity}`);

  return useUnscopedEntity(entities[entity], selector, equalityFn);
};

export default useEntity;
