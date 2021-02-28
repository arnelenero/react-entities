import React, { useContext } from 'react';
import { createEntity } from './createEntity';
import EntityContext from './EntityContext';

export const EntityScope = ({ entities, children }) => {
  const inheritedEntities = useContext(EntityContext);
  const instances = { ...inheritedEntities };

  for (let k in entities) {
    const item = entities[k];
    const entity = item instanceof Array ? item[0] : item;
    const deps = item instanceof Array ? item[1] : undefined;
    instances[k] = createEntity(entity, deps);
  }

  return (
    <EntityContext.Provider value={instances}>
      {children}
    </EntityContext.Provider>
  );
};

export default EntityScope;
