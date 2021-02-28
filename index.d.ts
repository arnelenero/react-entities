export type Action = (...args: any[]) => any;

export interface Actions {
  [actions: string]: Action;
}

export type SubscriberFn<S = object> = (state: S) => void;

export type UpdaterFn<S = object> = (state: S, ...args: any[]) => Partial<S>;

export type SetStateFn<S = object> = (
  updates: Partial<S> | UpdaterFn<S>,
  ...updaterArgs: any[]
) => void;

export interface EntityOptions<S = object> {
  beforeSetState: (state: S, updates: Partial<S>) => void;
}

export interface Entity<S = object, A = Actions> {
  state: S;
  initialState: S;
  setState: SetStateFn<S>;
  actions: A;
  subscribers: SubscriberFn<S>[];
  reset: () => void;
}

export type ActionComposer<S = object, A = Actions, D = any> = (
  entity: Entity<S, A>,
  deps: D
) => Action;

export interface EntityDefinition<S = object, A = Actions, D = any> {
  initialState?: S;
  options?: EntityOptions<S>;
  [key: string]: S | EntityOptions<S> | ActionComposer<S, A, D>;
}

export type EntityHook<S = object, A = Actions> = <T extends unknown = S>(
  selector?: (state: S) => T,
  equalityFn?: (a: any, b: any) => boolean
) => [T, A];

/**
 * Creates an entity based on the given definition.
 *
 * @param definition - entity definition
 * @param deps - optional dependencies (e.g. service)
 */
export function createEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): Entity<S, A>;

/**
 * Propagates entities down to its entire component subtree,
 * thereby making them "scoped entities".
 */
export function EntityScope(props: {
  entities: {
    [id: string]: EntityDefinition<any> | [ EntityDefinition<any>, any ];
  };
  children: React.ReactNode;
}): JSX.Element;

/**
 * Hook that returns a scoped entity's value (or its
 * derivative via optional selector) and actions.
 *
 * @param entityId - the ID of the entity
 * @param selector - optional selector function
 * @param equalityFn - optional equality test (default: strictEqual)
 */
export function useEntity<S = any, A = Actions>(
  entityId: string,
  selector?: (state: any) => S,
  equalityFn?: (a: any, b: any) => boolean
): [S, A];

/**
 * Creates an entity based on given definition, then returns a
 * corresponding entity hook.
 *
 * This is used in code patterns using unscoped entities.
 *
 * @param definition - entity definition
 * @param deps - optional dependencies (e.g. service)
 */
export function makeEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): EntityHook<S, A>;

/**
 * Hook that automatically resets values of all entities
 * when the component unmounts.
 *
 * This is used in code patterns using unscoped entities.
 */
export function useEntityBoundary(): void;

export function strictEqual(a: any, b: any): boolean;
export function shallowEqual(a: any, b: any): boolean;

export function selectAll<S = object>(o: S): S;
export function selectNone<S = object>(_: S): null;
