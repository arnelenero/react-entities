# React Entities

React Entities is an ultra-lightweight library that provides the simplest global state management for React apps. It takes advantage of React Hooks.

If you are familiar with Redux, you may consider this alternative for the following reasons:
- No complex boilerplate code required
- No need for reducers and dispatch
- Uses plain functions to implement actions
- No need for middleware and other added complexities
- Does not use Context API; has straightforward subscription instead
- No explicit container (i.e. "store") to care about
- Made specifically for React, and built on React Hooks 

You may also consider React Entities to replace other app-state libraries if you prefer to keep things as simple as possible.

**Easy to learn.** If you know React Hooks, you'll be coding React Entities in no time at all.

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

  export function increment() {
    this.setState({ value: this.state.value + 1 });
  }

  export function decrement() {
    this.setState({ value: this.state.value - 1 });
  }
```

### Defining the initial state

It is recommended that you define the `initialState` of an entity to properly set default values. This should always be an object. Since it is optional, it defaults to an empty object `{}`.

### Defining the actions

In the example above, `increment` and `decrement` are both actions. It is important to note that actions should be **regular functions**, and not arrow functions, because they need to have proper context to `this`, which represents the entity itself.

Within an action function, you can use `this.state` to reference the current state of the entity. To make any changes to the state, you should use `this.setState()`. **Do not** directly mutate the `this.state` object.

The function `this.setState()` has the following signature:
```
this.setState( changes )
```
where `changes` is an object whose properties are merged into the current state, thus overriding the old values.


## Creating Entity Hooks

To enable us to bind our entities to components, we'll need Hooks. To create one such hook, we use the `makeEntity` function.

```javascript
makeEntity( entityDefinition )
```
This function creates an entity based on the provided definition, then returns an _entity hook_. The argument `entityDefinition` is imported from our entity module, as in this example:

**entities/index.js**
```javascript
import { makeEntity } from 'react-entities';
import * as counter from './counter'

export const useCounter = makeEntity(counter);
```

## Using Entity Hooks in Components

An entity hook returns an array containing two items: the entity state object, and an object containing all the entity's actions.

Here is an example usage:

**CounterView.js**
```javascript
import React, { useCallback } from 'react';

import { useCounter } from './entities';

const CounterView = () => {
  [counter, { increment, decrement }] = useCounter();

  const handleClickIncrement = useCallback(() => increment(), []);
  const handleClickDecrement = useCallback(() => decrement(), []);

  return (
    <div>{counter.value}</div>
    <button onClick={handleClickIncrement}>Increment</button>
    <button onClick={handleClickDecrement}>Decrement</button>
  )
};
