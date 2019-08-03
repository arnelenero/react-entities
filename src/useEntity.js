import { useState, useEffect } from 'react';

import store from './store';

export const useEntity = entityId => {
  const entity = store[entityId];
  const setState = useState()[1];

  useEffect(() => {
    entity.subscribers.push(setState);
    return () => {
      entity.subscribers = entity.subscribers.filter(
        subscriber => subscriber !== setState
      );
    };
  }, []);

  return [entity.state, entity.actions];
};

export default useEntity;
