export type Action = (...args: any[]) => any;

export interface ActionsObject {
  [actions: string]: Action;
}

export type StateSetter<S = object> = (state: S) => void;

export type UpdaterFn = (updates: object) => void;

export interface Entity<S = object, F = StateSetter> {
  state: S;
  subscribers: F[];
  reset: () => void;
  setState: UpdaterFn;
  actions: ActionsObject;
}

export type ActionComposer = (entity: Entity) => Action;

export interface EntityDefinition<S = object> {
  initialState?: S;
  [actions: string]: ActionComposer;
} 

export type EntityHookValue<S, T> = [S, T];

export type EntityHook<S, T> = () => EntityHookValue<S, T>;

export function makeEntity<S = object, T = ActionsObject>(definition: EntityDefinition<S>, deps?: any): EntityHook<S, T>;

export function useEntityBoundary(): void;
