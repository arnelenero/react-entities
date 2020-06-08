export type Action = (...args: any[]) => any;

export interface ActionsObject {
  [actions: string]: Action;
}

export type SubscriberFn<S = object> = (state: S) => void;

export type SetStateFn = (updates: object) => void;

export interface EntityOptions<S = object> {
  beforeSetState: (state: S, updates: object) => void;
}

export interface Entity<S = object, F = SubscriberFn> {
  state: S;
  subscribers: F[];
  reset: () => void;
  options: EntityOptions<S>;
  setState: SetStateFn;
  actions: ActionsObject;
}

export type ActionComposer = (entity: Entity, deps?: any) => Action;

export interface EntityDefinition<S = object> {
  initialState?: S;
  options?: EntityOptions;
  [actions: string]: any;
} 

export type EqualityFn = (a: any, b: any) => boolean;

export type Selector<S = object> = (state: S) => any;

export type EntityHookValue<S, T> = [S, T];

export type EntityHook<S, T> = (selector?: Selector<S>, equalityFn?: EqualityFn) => EntityHookValue<S, T>;

export function makeEntity<S = object, T = ActionsObject>(definition: EntityDefinition<S>, deps?: any): EntityHook<S, T>;

export function useEntityBoundary(): void;

export function strictEqual(a: any, b: any): boolean;
export function shallowEqual(a: any, b: any): boolean;

export function selectAll<S = object>(o: S): S;
export function selectNone<S = object>(_: S): null;
