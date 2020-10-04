import { useState, useCallback, useEffect } from 'react';

import { selectAll, strictEqual } from './utils';

export const useEntity = (
  entity,
  selector = selectAll,
  equalityFn = strictEqual
) => {
  const selected = selector(entity.state);

  const [state, setState] = useState(selected);

  const subscriberFn = useCallback(
    newState => {
      const newSelected = selector(newState);
      const hasChanged = !equalityFn(state, newSelected);
      if (hasChanged) setState(newSelected);
    },
    [selector, equalityFn]
  );

  useEffect(() => {
    entity.subscribers.push(subscriberFn);
    return () => {
      for (let i = 0, c = entity.subscribers.length; i < c; i++) {
        if (entity.subscribers[i] === subscriberFn) {
          // Avoid causing subscribers array items to shift at this point.
          // The subscriber invocation loop in entity (see makeEntity.js)
          // should do the cleanup instead.
          // Was: entity.subscribers.splice(i, 1);
          entity.subscribers[i] = null;
          break;
        }
      }
    };
  }, [subscriberFn]);

  return [selected, entity.actions];
};

export default useEntity;
