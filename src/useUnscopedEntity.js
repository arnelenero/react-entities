import { useState, useCallback, useEffect } from 'react';

import { selectAll, strictEqual } from './utils';

export const useUnscopedEntity = (
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
    [selector, equalityFn, state]
  );

  useEffect(() => {
    entity.subscribers.push(subscriberFn);
    return () => {
      for (let i = 0, c = entity.subscribers.length; i < c; i++) {
        if (entity.subscribers[i] === subscriberFn) {
          entity.subscribers[i] = null;
          break;
        }
      }
    };
  }, [subscriberFn, entity.subscribers]);

  return [selected, entity.actions];
};

export default useUnscopedEntity;
