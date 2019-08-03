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
          entity.subscribers.splice(i, 1);
          break;
        }
      }
    };
  }, []);

  return [entity.state, entity.actions];
};

export default useEntity;
