# React Entities

[![npm](https://img.shields.io/npm/v/react-entities)](https://www.npmjs.com/package/react-entities)
[![build](https://img.shields.io/travis/arnelenero/react-entities)](https://travis-ci.org/github/arnelenero/react-entities)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/react-entities)](https://coveralls.io/github/arnelenero/react-entities)
[![license](https://img.shields.io/github/license/arnelenero/react-entities)](https://opensource.org/licenses/MIT)

React Entities is an ultra-lightweight library that provides the simplest state management for React apps. It takes advantage of React Hooks.

## Why React Entities?

Here are some of the benefits of using React Entities:
- No complicated constructs or boilerplate 
- No steep learning curve
- Uses plain functions to implement state changes
- Largely unopinionated and flexible syntax
- Full TypeScript support
- Made specifically for React, and built on React Hooks 
- Production-grade, well-documented, actively supported
- It's tiny, only about 1 KB (minified + gzipped)


## Setup

To install:
```
npm install react-entities
```


## What is an Entity?

An _entity_ is a single-concern data object whose _state_ can be bound to any number of components in the app as a "shared" state. Once bound to a component, an entity's state acts like local state, i.e. it causes the component to update on every change.

Apart from state, each entity would also have _actions_, which are just normal functions that make changes to the entity's state.


## Creating an Entity

A typical entity definition would be a regular module that exports an initial state and several action functions. Here's a simple example:

**entities/counter.js**
```js
export const initialState = {
  value: 0
};

export const increment = counter => by => {
  counter.setState({ value: counter.state.value + by });
};

export const decrement = counter => by => {
  counter.setState({ value: counter.state.value - by });
};
```

<details>
  <summary>TypeScript version</summary><br/>

**entities/counter.ts**
```ts
import { Entity } from 'react-entities';

/** Types **/

export interface Counter {  // 👈
  value: number;
};

export interface CounterActions {
  increment: (by: number) => void;
  decrement: (by: number) => void;
};

export type CounterEntity = Entity<Counter, CounterActions>;  // 👈

/** Implementation **/

//                           👇
export const initialState: Counter = {
  value: 0
};
//                                      👇
export const increment = (counter: CounterEntity) => (by: number) => {
  counter.setState({ value: counter.state.value + by });
};
//                                      👇
export const decrement = (counter: CounterEntity) => (by: number) => {
  counter.setState({ value: counter.state.value - by });
};
```

</details>

### Defining the initial state

The `initialState` defines the default state of the entity. This should always be an object. Since it's optional, it defaults to `{}`.

### Defining actions

In the example above, `increment` and `decrement` are both actions. Although actions are ultimately just normal functions, notice that they are defined using _higher-order functions_, or _composers_. This enables passing an entity reference to the action in its definition.

This is the basic form of an action definition:
```js
(entity) => (...arguments) => {}
```

Within the action function, we can use the `state` property of the entity to refer to its current state. To make any changes to its state, we can use its `setState()` function. **Do not** directly mutate the `state` object.

The function `setState()` has the following familiar form:
```js
entity.setState(updates)
```
where `updates` is an object whose properties are __shallowly merged__ with the current state, thus overriding the old values. 


## Adding an Entity to a Scope

Before we can access an entity in our components, we need to attach it to a _scope_. The `<EntityScope>` component propagates entities down its entire component subtree.

**App.js**
```jsx
import { EntityScope } from 'react-entities';
import * as counter from './entities/counter';

const App = () => {
  <Header />

  <EntityScope entities={{ counter }}>
    <CounterView />
  </EntityScope>

  <Footer />
}
```
(TypeScript version is the same)

In the example above, `<CounterView>` and all its descendant components have access to the `counter` entity, while `<Header>` and `<Footer>`, and everything else outside the scope, do not.

We can attach any number of entities to a single `<EntityScope>`. The `entities` prop is an object that maps each entity to an ID that can be used to access the entity in components within the scope. In our example above, the entity becomes accessible using the entity ID `'counter'`.


## Using an Entity in Components

The `useEntity` hook allows us to bind an entity to a component. It takes an entity ID, finds the matching entity within the scope, and returns a pair of values: the entity state and an object containing actions. 

```js
useEntity(entityId) => [state, actions]
```

Here is an example usage:

**CounterView.js**
```jsx
import { useEntity } from 'react-entities';

export const CounterView = () => {
  const [counter, { increment, decrement }] = useEntity('counter');

  return (
    <>
      <div>{counter.value}</div>
      <button onClick={() => increment(1)}>Increment</button>
      <button onClick={() => decrement(1)}>Decrement</button>
    </>
  );
};
```

<details>
  <summary>TypeScript version</summary><br/>

**CounterView.tsx**
```tsx
import { useEntity } from 'react-entities';
import { Counter, CounterActions } from './entities/counter';

export const CounterView = () => {
  const [counter, { increment, decrement }] = 
    useEntity<Counter, CounterActions>('counter');
    //           👆           👆 
  return (
    <>
      <div>{counter.value}</div>
      <button onClick={() => increment(1)}>Increment</button>
      <button onClick={() => decrement(1)}>Decrement</button>
    </>
  );
};
```

</details>


## Recipes

With the very straightforward, largely unopinionated approach that React Entities brings to managing app state, you have full flexibility to implement things the way you want. It works seamlessly with whatever code architecture you choose for your React app. 

Here we provide some suggested patterns that you may consider for specific scenarios.

[Binding only relevant data to a component](#binding-only-relevant-data-to-a-component)  
[Async actions](#async-actions)  
[Calling other actions from an action](#calling-other-actions-from-an-action)  
[Injecting dependencies into an entity](#injecting-dependencies-into-an-entity)  
[Multiple and nested entity scopes](#multiple-and-nested-entity-scopes)  
[Separating "pure" state changes from actions](#separating-pure-state-changes-from-actions)  
[Unit testing of entities](#unit-testing-of-entities)  

### Binding only relevant data to a component

By default, the `useEntity` hook binds the entire state of the entity to our component. Changes made to any part of this state, even those that are not relevant to the component, would cause a re-render.

To circumvent this, we can pass a _selector_ function to the hook, as in this example:

**MainView.js**
```jsx
import { useEntity } from 'react-entities';

const MainView = () => {
  const [config, { loadConfig }] = useEntity('settings', state => state.config);
  //                                                           👆
  return ( 
    //  . . .
  );
};
```

<details>
  <summary>TypeScript version</summary><br/>

**MainView.tsx**
```tsx
import { useEntity } from 'react-entities';
import { Settings, Config, SettingsActions } from './entities/settings';

const MainView = () => {
  const [config, { loadConfig }] = 
    useEntity<Config, SettingsActions>('settings', (state: Settings) => state.config);
    //                                                               👆
  return ( 
    //  . . .
  );
```

</details>

Whenever the entity state is updated, the selector function is invoked to provide our component only the relevant data derived from the state. If the result of the selector is equal to the previous result, the component will not re-render.

The equality check used to compare the current vs. previous selector result is, by default, strict/reference equality, i.e. `===`. We can specify a different equality function if needed. The library provides `shallowEqual` for cases when the selector returns an object with top-level properties derived from the entity state, as in the example below:

**MainView.js**
```jsx
import { useEntity, shallowEqual } from 'react-entities';

const MainView = () => {
  const [settings, settingsActions] = useEntity('settings', state => {
    return {
      theme: state.theme,
      enableCountdown: state.featureFlags.countdown
    }
  }, shallowEqual);
  //      👆
  return ( 
    //  . . .
  );
};
```

<details>
  <summary>TypeScript version</summary><br/>

**MainView.tsx**
```tsx
import { useEntity } from 'react-entities';
import { Settings, Theme, SettingsActions } from './entities/settings';

interface MainConfig {
  theme: Theme;
  enableCountdown: boolean;
}

const MainView = () => {
  const [config, { loadConfig }] = 
    useEntity<MainConfig, SettingsActions>('settings', (state: Settings) => {
      return {
        theme: state.theme,
        enableCountdown: state.featureFlags.countdown
      }
    }, shallowEqual);
    //      👆
  return ( 
    //  . . .
  );
```

</details>

In case you only require access to actions and not the entity state at all, you can use the selector `selectNone`. This selector always returns `null`.

**Page.js**
```jsx
import { useEntity, selectNone } from 'react-entities';

const Page = () => {
  const [, { loadConfig }] = useEntity('settings', selectNone);
  //                                                    👆
  return ( 
    //  . . .
  );
};
```

<details>
  <summary>TypeScript version</summary><br/>

**Page.tsx**
```tsx
import { useEntity, selectNone } from 'react-entities';
import { SettingsActions } from './entities/settings';

const Page = () => {
  const [, { loadConfig }] = 
    useEntity<null, SettingsActions>('settings', selectNone);
    //         👆                                     👆
  return ( 
    //  . . .
  );
```

</details><br />

[⬆️ Recipes](#recipes)

### Async actions

A typical action makes state changes then immediately terminates. However, since actions are just plain functions, they can contain any operations, including async ones. This gives us the flexibility of implementing things like async data fetches inside actions.

Here is an example using `async/await` for async action:

**entities/settings.js**
```js
import { fetchConfig } from './configService';

export const initialState = {
  loading: false,
  config: null
};
//                                      👇
export const loadConfig = settings => async () => {
  settings.setState({ loading: true });

  const res = await fetchConfig();
  settings.setState({ loading: false, config: res });
};
```

<details>
  <summary>TypeScript version</summary><br/>

**entities/settings.ts**
```ts
import { Entity } from 'react-entities';
import { fetchConfig, Config } from './configService';

/** Types **/

export interface Settings {
  loading: boolean;
  config: Config;
};

export interface SettingsActions {
  //                    👇
  loadConfig: () => Promise<void>;
};

export type SettingsEntity = Entity<Settings, SettingsActions>;

/** Implementation **/

export const initialState: Settings = {
  loading: false,
  config: null
};
//                                                        👇
export const loadConfig = (settings: SettingsEntity) => async () => {
  settings.setState({ loading: true });

  const res = await fetchConfig();
  settings.setState({ loading: false, config: res });
};                                   
```

</details><br />

[⬆️ Recipes](#recipes)

### Calling other actions from an action

An `actions` object is included in the entity reference that is passed onto actions, which allows them to call other actions, as in this example:

```js
export const loadAndApplyTheme = ui => async () => {
  const res = await fetchTheme();
  //    👇
  ui.actions.switchTheme(res);
};

export const switchTheme = ui => theme => {
  ui.setState({ theme });
}
```
__Why not call `switchTheme` directly?__ Remember that the action definition here is a composer function, whereas the final composed action that we invoke at runtime is just a normal function.

[⬆️ Recipes](#recipes)

### Injecting dependencies into an entity

We can separate reusable code like API calls, common business logic and utilities from our entity code. Instead of importing these _services_ directly into an entity, we can use _dependency injection_ to reduce coupling.

This is achieved by pairing the entity with its dependencies as a tuple in the `entities` prop of the `<EntityScope>`.

**App.js**
```jsx
import { EntityScope } from 'react-entities';
import * as counter from './entities/counter';
import * as settings from './entities/settings';
import * as configService from './services/configService'; 

const App = () => {
  <EntityScope entities={{ 
    counter,
    settings: [settings, configService]  // 👈 
  }}>
    <CounterView />
  </EntityScope>
}
```
(TypeScript version is the same)

This second argument is passed automatically as extra argument to our action composer function.

**entities/settings.js**
```js
export const initialState = {
  loading: false,
  config: null
};
//                                      👇
export const loadConfig = (settings, service) => async () => {
  settings.setState({ loading: true });

  const res = await service.fetchConfig();
  settings.setState({ loading: false, config: res });
};
```

In the example above, the `service` would be the `configService` passed via the entity scope.

[⬆️ Recipes](#recipes)

### Multiple and nested entity scopes

It is simplest to have a single entity scope for all our entities at the top-level component. However, we can have any number of entity scopes, at different levels in our component tree. With nested scopes, entities in the outer scopes are passed down to the inner scopes.

If you attach the same entity to multiple scopes, each scope will propagate a __separate instance__ of the entity, even if you use the same entity ID across these scopes. When used in a component, that ID then refers to the instance at the nearest scope up the hierarchy.

```jsx
import { EntityScope } from 'react-entities';
import * as counter from './entities/counter';
import * as settings from './entities/settings';

const App = () => {
  <EntityScope entities={{ counter, settings }}>
    <CounterView />

    <EntityScope entities={{ counter }}>
      <SubCounterView />
    </EntityScope>
  </EntityScope>
}
```
(TypeScript version is the same)

In our example above, `settings` is accessible to both `<CounterView>` and `<SubCounterView>`, while each of those components will "see" a different `counter`.

The example is just illustrative, but in practice, multiple scopes are most useful if we do code-splitting. A lazy loaded module can have its own scope for entities that are needed only by that feature.

[⬆️ Recipes](#recipes)

### Separating "pure" state changes from actions

Using _pure functions_ for updating state has its benefits. Since an entity action can be pretty much any function, it does not automatically prevent _side effects_.

To allow us to separate "pure" state updates, `setState()` can accept an _updater function_ with the following form:
```js
updaterFn(state, ...args) => changes
```
where `state` is the current state and the optional `args` can be any number of arguments. This function returns the changes that will be __shallowly merged__ with the current state by `setState()`.

The `setState()` call inside actions will then have to be in this form: 
```js
setState(updaterFn, ...updaterArgs)
```

In the example below, we can see that this pattern gives us the benefits of pure functions: readability, predictability and reusability among others.

```js
export const signIn = (auth, service) => async (email, password) => {
  auth.setState(updatePendingFlag, true);

  const { userId, role } = await service.signIn(email, password);
  auth.setState(updateAuth, userId, role);
};

/*** State Updaters ***/

const updateAuth = (state, userId, role) => {
  return { userId, role, isAuthPending: false };
};

const updatePendingFlag = (state, pending) => {
  return { isAuthPending: pending };
};
```

Pure state updaters can also be nested to encourage modularity, like in this example:

```js
const updateAuth = (state, userId, role) => {
  return { 
    userId, 
    role, 
    ...updatePendingFlag(state, false)  // 👈
  };
};

const updatePendingFlag = (state, pending) => {
  return { isAuthPending: pending };
};
```

[⬆️ Recipes](#recipes)

### Unit testing of entities

When we unit test our entities, ideally we would isolate them from the components that use them. For this purpose, we can use the `createEntity` function. It creates an instance of the entity and returns a direct reference to it.

**counter.test.js**
```js
import { createEntity } from 'react-entities';
import * as _counter from './counter';

let counter = null;
beforeAll(() => {
  counter = createEntity(_counter);  // 👈
});

beforeEach(() => {
  //        👇
  counter.reset();
});

describe('counter', () => {
  describe('increment', () => {
    it('increments the value of the counter', () => {
      //        👇
      counter.actions.increment(1);
      expect(counter.state.value).toBe(1);
      //               👆
    });
  });
});
```

In the example Jest unit test above, `createEntity` gives us the `counter` instance. This way, we are able to trigger an action in `counter.actions`, and then inspect the current state via `counter.state`. It also provides `counter.reset()` to allow us to reset the entity to its `initialState` before each test case is executed.

[⬆️ Recipes](#recipes)
