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
  deps?: D
) => Action;

export type ActionComposers<S = object, A = Actions, D = any> = {
  [action in keyof A]: ActionComposer<S, A, D>;
};

export interface EntityDefinition<S = object, A = Actions, D = any> {
  initialState?: S;
  options?: EntityOptions<S>;
  [key: string]: S | EntityOptions<S> | ActionComposer<S, A, D>;
}

export type EntityHook<S = object, A = Actions> = (
  selector?: (state: S) => any,
  equalityFn?: (a: any, b: any) => boolean
) => [S, A];

export function createEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): Entity<S, A>;

export function makeEntity<S = object, A = Actions, D = any>(
  definition: EntityDefinition<S, A, D>,
  deps?: D
): EntityHook<S, A>;

export function useEntityBoundary(): void;

export function strictEqual(a: any, b: any): boolean;
export function shallowEqual(a: any, b: any): boolean;

export function selectAll<S = object>(o: S): S;
export function selectNone<S = object>(_: S): null;
