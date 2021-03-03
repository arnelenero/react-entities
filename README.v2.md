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

export interface Counter {
  value: number;
};

export interface CounterActions {
  increment: (by: number) => void;
  decrement: (by: number) => void;
};

export type CounterEntity = Entity<Counter, CounterActions>;

/** Implementation **/

export const initialState: Counter = {
  value: 0
};

export const increment = (counter: CounterEntity) => (by: number) => {
  counter.setState({ value: counter.state.value + by });
};

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
```
(entity) => (...arguments) => {}
```

Within the action function, we can use the `state` property of the entity to refer to its current state. To make any changes to its state, we can use its `setState()` function. **Do not** directly mutate the `state` object.

The function `setState()` has the following familiar form:
```
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
  const [counter, { increment, decrement }] = useEntity<Counter, CounterActions>('counter');

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

### Binding only relevant data to a component

By default, the `useEntity` hook binds the entire state of the entity to our component. Changes made to any part of this state, even those that are not relevant to the component, would cause a re-render.

To circumvent this, we can pass a _selector_ function to the hook, as in this example:

**MainView.js**
```js
import { useEntity } from 'react-entities';

const MainView = () => {
  const [config, { loadConfig }] = useEntity('settings', state => state.config);
  //                                                           👆
  return ( 
  //  . . .
  );
};
```

Whenever the entity state is updated, the selector function is invoked to provide our component only the relevant data derived from the state. If the result of the selector is equal to the previous result, the component will not re-render.

The equality check used to compare the current vs. previous selector result is, by default, strict/reference equality, i.e. `===`. We can specify a different equality function if needed. The library provides `shallowEqual` for cases when the selector returns an object with top-level properties derived from the entity state, as in the example below:

**MainView.js**
```js
import { useEntity, shallowEqual } from 'react-entities';

const MainView = () => {
  const [settings, settingsActions] = useEntity('settings', state => {
    return {
      theme: state.theme,
      featureFlags: state.featureFlags
    }
  }, shallowEqual);
  //      👆
  return ( 
  //  . . .
  );
};
```

In case you only require access to actions and not the entity state at all, you can use the selector `selectNone`. This selector always returns `null`.

**Page.js**
```js
import { useEntity, selectNone } from 'react-entities';

const Page = () => {
  const [, { loadConfig }] = useEntity('settings', selectNone);
  //                                                    👆
  return ( 
  //  . . .
  );
};
```

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

