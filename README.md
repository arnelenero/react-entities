# React Entities

[![npm](https://img.shields.io/npm/v/react-entities)](https://www.npmjs.com/package/react-entities)
[![build](https://img.shields.io/travis/arnelenero/react-entities)](https://travis-ci.org/github/arnelenero/react-entities)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/react-entities)](https://coveralls.io/github/arnelenero/react-entities)
[![license](https://img.shields.io/github/license/arnelenero/react-entities)](https://opensource.org/licenses/MIT)

React Entities is an ultra-lightweight library that provides the simplest global state management for React apps. It takes advantage of React Hooks.

Here are some benefits of using React Entities:
- No complex boilerplate code required
- No steep learning curve
- No need for things like reducers, dispatch, middleware, observables
- Just use functions to implement actions
- No Context API, just straightforward hook
- No explicit container (i.e. "store") or providers
- Easy unit testing of app state and actions
- Made specifically for React, and built on React Hooks 
- Works up to 5x faster than useContext + useReducer solution
- It's tiny, only about 1 KB (minified + gzipped)

If you know React Hooks, you'll be coding React Entities in no time at all.

## Setup

To install:
```
npm install react-entities
```

## Getting Started

There is just one simple concept that you need to know to get started with React Entities--what exactly is an entity.

An _entity_ is a logical chunk of data whose _state_ can be bound to any number of components in the app. In this sense it is "global" or "shared" within the context of the entire app. Once bound to a component, an entity's state acts like local state, i.e. it causes the component to update on every change.

Apart from state, each entity would also have _actions_, which are just regular functions that make changes to the entity's state. In fact, you can think of an entity just like a regular Javascript object that has a single property (the state) and one or several methods (actions).


## Creating Entities

A typical entity definition would be a regular module that exports an `initialState` object as well as several action functions. Here is a simple example:

**entities/counter.js**
```javascript
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

### Defining the initial state

It is recommended that you define the `initialState` of an entity to properly set default values. This should always be an object. Since it is optional, it defaults to an empty object `{}`.

### Defining the actions

In the example above, `increment` and `decrement` are both actions. It is important to note that actions are defined using higher-order functions, with the top level function passing down the entity reference.

Within the actual action function, you can use the `state` property of the entity to reference its current state. To make any changes to its state, you should use its `setState()`. **Do not** directly mutate the `state` object.

The function `setState()` has the following familiar signature:
```
entity.setState( changes )
```
where `changes` is an object whose properties are shallowly merged with the current state, thus overriding the old values. Unlike React's `setState()`, this one doesn't have to support updater function as argument given that the `state` value available within the action itself is *always* up-to-date.


## Creating Entity Hooks

To enable us to bind our entities to components, we'll need Hooks. To create one such hook, we use the `makeEntity` function.

```javascript
makeEntity( entityDefinition )
```
This function creates an entity based on the provided definition, then returns an _entity hook_. The argument `entityDefinition` is imported from our entity module, as in this example:

**entities/index.js**
```javascript
import { makeEntity } from 'react-entities';
import * as counter from './counter';

export const useCounter = makeEntity(counter);
```

## Using Entity Hooks in Components

An entity hook returns an array containing two items: the entity state object, and an object containing all the entity's actions. This allows the component to both reference the entity's current state, and invoke its actions within callbacks and effects.

Here is an example usage:

**CounterView.js**
```javascript
import React from 'react';

import { useCounter } from './entities';

export const CounterView = () => {
  const [counter, { increment, decrement }] = useCounter();

  return (
    <>
      <div>{counter.value}</div>
      <button onClick={() => increment(1)}>Increment</button>
      <button onClick={() => decrement(1)}>Decrement</button>
    </>
  );
};
```

As you can see in the above example, it is typical to use the object-spread operator to extract only the relevant actions from the entity, instead of the entire actions object.

## Recipes

With the very straightforward, largely unopinionated approach that React Entities brings to managing app state, you have full flexibility to implement things the way you want. It works seamlessly with whatever code architecture you choose for your React app. 

Here we provide some suggested patterns that you may consider for specific scenarios.

[Async fetch operations within actions](#async-fetch-operations-within-actions)  
[Binding only relevant data to components](#binding-only-relevant-data-to-components)  
[Injecting dependencies into entities](#injecting-dependencies-into-entities)  
[Unit testing of entities](#unit-testing-of-entities)  
[Teardown of entities during app testing](#teardown-of-entities-during-app-testing)  

### Async fetch operations within actions

In some cases components require data that has to be fetched from the server. For this we would need an async operation that sends the fetch request and waits for server response.

Typical actions immediately make state changes then terminate. But because actions are just functions, they can contain any operations, including async ones. This affords us the flexibility of implementing data fetches inside actions.

Here is an example:

**entities/settings.js**
```javascript
import { fetchConfig } from './configService';

export const initialState = {
  loading: false,
  config: null
};

export const loadConfig = settings => async () => {
  settings.setState({ loading: true });

  const res = await fetchConfig();
  settings.setState({ loading: false, config: res });
};
```

### Binding only relevant data to components

By default, using an entity hook binds the entire state of the entity to your component. Changes made to any part of this state, even those that are not relevant to the component, would re-render your component.

To circumvent this, you can pass a _selector_ function to the hook, as in this example:

**MainView.js**
```javascript
const MainView = () => {
  const [config, { loadConfig }] = useSettings(state => state.config);

  return ( 
    . . .
  );
};
```

Whenever the entity state is updated, the selector function is invoked to provide your component the relevant data derived from the entity state. If the result of the selector call is equal to the previous result, the component will not re-render.

The equality check used to compare the current vs. previous selector result is, by default, strict/reference equality, i.e. `===`. You can specify a different equality function if needed. The library provides `shallowEqual` for cases when your selector returns an object with top-level properties derived from the entity state, as in the example below:

**MainView.js**
```javascript
import { shallowEqual } from 'react-entities';

const MainView = () => {
  const [settings, settingsActions] = useSettings(state => {
    return {
      theme: state.config.theme,
      featureFlags: state.config.featureFlags
    }
  }, shallowEqual);

  return ( 
    . . .
  );
};
```

In case you only require access to actions and not the entity state at all, you can use the selector `() => null` to ensure the entity never causes a re-render. This null selector is also provided by the library as `selectNone` and is the preferred form, to avoid recreating the function on each render.

**Page.js**
```javascript
import { selectNone } from 'react-entities';

const Page = () => {
  const { loadConfig } = useSettings(selectNone)[1];

  return ( 
    . . .
  );
};
```

### Injecting dependencies into entities

Sometimes you would need to mock the API calls, for example, when unit testing your entities. In scenarios like these, you can take advantage of dependency injection. The `makeEntity` function accepts an optional second argument which is passed onto your entity.

**entities/index.js**
```javascript
import { makeEntity } from 'react-entities';
import * as settings from './settings';
import * as configMock from './configMock';

export const useSettings = makeEntity(settings, configMock);
```

This second argument is passed automatically as extra argument to your action composer function.

**entities/settings.js**
```javascript
export const initialState = {
  loading: false,
  config: null
};

export const loadConfig = (settings, service) => async () => {
  settings.setState({ loading: true });

  const res = await service.fetchConfig();
  settings.setState({ loading: false, config: res });
};
```

In the example above, the `service` would be the `configMock` passed through `makeEntity`.

Beyond this example, you can inject any type of dependency into your entity, e.g. a keyed list of services, as long as all actions of that entity know how to handle it. 

Unit testing is not the only use-case for dependency injection. It can also be used in multi-tenant web apps, or really any other cases that require different behaviors depending on the scenario.


### Unit testing of entities

When we unit test our entities, ideally we would want it to be isolated from the React components that use them. For this purpose, we cannot use `makeEntity` because it returns an entity hook. Instead, we can use the drop-in replacement called `createEntity`, which follows exactly the same syntax but returns a direct reference to the hook instead.

**counter.test.js**
```javascript
import { createEntity } from 'react-entities';
import * as _counter from './counter';

let counter = null;
beforeAll(() => {
  counter = createEntity(_counter);
});

beforeEach(() => {
  counter.reset();
});

describe('counter', () => {
  describe('increment', () => {
    it('increments the value of the counter', () => {
      counter.actions.increment(1);
      expect(counter.state.value).toBe(1);
    });
  });
});
```

In the sample Jest unit test above, `createEntity` gives us the `counter` entity object. This way, we are able to trigger an action by accessing `counter.actions`, and then inspect the current state of the entity via `counter.state`. It also provides `counter.reset()` that allows us to reset the entity to its `initialState` before each test case is executed.


### Teardown of entities during app testing

All the entities are stored at the module level, outside of the React component tree. For the app itself, this is not a problem. However, in testing the app, you would typically setup and teardown the App component multiple times, and therefore entities must be reset to initial state each time.

For this purpose you can use the `useEntityBoundary` hook. It resets all entities each time the host component unmounts. Use this hook in a top-level component, typically the `App`.

Here is an example usage:

**App.js**
```javascript
import { useEntityBoundary } from 'react-entities';

const App = () => {
  useEntityBoundary();

  return ( 
    . . .
  );
};
```
