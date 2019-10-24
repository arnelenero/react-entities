import { useState, useEffect } from 'react';

import store from './store';

export const useEntity = entityId => {
  const entity = store[entityId];
  const setState = useState()[1];

  useEffect(() => {
    entity.subscribers.push(setState);
    return () => {
      for (let i = 0, c = entity.subscribers.length; i < c; i++) {
        if (entity.subscribers[i] === setState) {
          // Avoid causing subscribers array items to shift at this point.
          // The subscriber invocation loop in entity (see makeEntity.js)
          // should do the cleanup instead.
          // Was: entity.subscribers.splice(i, 1);
          entity.subscribers[i] = null;
          break;
        }
      }
    };
  }, []);

  return [entity.state, entity.actions];
};

export default useEntity;
