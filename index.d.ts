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

export type EntityHookValue<S> = [S, ActionsObject];

export type EntityHook<S> = () => EntityHookValue<S>;

export function makeEntity<S = object>(definition: EntityDefinition<S>): EntityHook<S>;

export function useEntityBoundary(): void;
