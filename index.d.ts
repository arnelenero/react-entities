export type Action = (...args: any[]) => any;

export interface Actions {
  [actions: string]: Action;
}

export type SubscriberFn<S = object> = (state: S) => void;

export type UpdaterFn<S = object> = (state: S, arg?: any) => Partial<S>;

export type SetStateFn<S = object> = (
  updates: Partial<S> | UpdaterFn<S>,
  updaterArg?: any
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

export function createEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): Entity<S, A>;

/**
 * Creates an entity based on given definition, then returns a
 * corresponding entity hook.
 */
export function makeEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): EntityHook<S, A>;

export function EntityScope(props: EntityScopeProps): JSX.Element;
interface EntityScopeProps {
  entities: {
    [name: string]: Entity<any> | EntityDefinition<any>;
  };
  children: React.ReactNode;
}

export function useEntity<S = any, A = Actions>(
  entity: string,
  selector?: (state: any) => S,
  equalityFn?: (a: any, b: any) => boolean
): [S, A];

export function useEntityBoundary(): void;

export function strictEqual(a: any, b: any): boolean;
export function shallowEqual(a: any, b: any): boolean;

export function selectAll<S = object>(o: S): S;
export function selectNone<S = object>(_: S): null;
