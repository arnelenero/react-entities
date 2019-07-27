import { useState, useEffect } from 'react';

import store from './store';

export const useEntity = entityId => {
  const entity = store[entityId];
  const newListener = useState()[1];

  useEffect(() => {
    entity.listeners.push(newListener);
    return () => {
      entity.listeners = entity.listeners.filter(
        listener => listener !== newListener
      );
    };
  }, []);

  return [entity.state, entity.actions];
};

export default useEntity;
