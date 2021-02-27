import React, { useContext } from 'react';
import { createEntity } from './createEntity';
import EntityContext from './EntityContext';

export const EntityScope = ({ entities, children }) => {
  const inheritedEntities = useContext(EntityContext);
  entities = { ...inheritedEntities, ...entities };

  for (let k in entities)
    if (entities[k].subscribers === undefined)
      entities[k] = createEntity(entities[k]);

  return (
    <EntityContext.Provider value={entities}>{children}</EntityContext.Provider>
  );
};

export default EntityScope;
