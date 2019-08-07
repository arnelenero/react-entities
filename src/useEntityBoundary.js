import { useEffect } from 'react';

import store from './store';

export const useEntityBoundary = () => {
  useEffect(() => {
    return () => {
      for (let entity in store) {
        store[entity].reset();
      }
    };
  }, []);
};

export default useEntityBoundary;
