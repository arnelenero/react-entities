# React Entities

[![npm](https://img.shields.io/npm/v/react-entities)](https://www.npmjs.com/package/react-entities)
[![build](https://img.shields.io/travis/arnelenero/react-entities)](https://travis-ci.org/github/arnelenero/react-entities)
[![coverage](https://img.shields.io/coveralls/github/arnelenero/react-entities)](https://coveralls.io/github/arnelenero/react-entities)
[![license](https://img.shields.io/github/license/arnelenero/react-entities)](https://opensource.org/licenses/MIT)

React Entities is an ultra-lightweight library that provides the simplest state management for React apps. It takes advantage of React Hooks.

## Why React Entities?

Here are some of the benefits of using React Entities:
- No complex constructs or boilerplate 
- No steep learning curve
- Uses plain functions to implement actions
- Largely unopinionated and flexible syntax
- Made specifically for React, and built on React Hooks 
- It's tiny, only about 1 KB (minified + gzipped)


## Setup

To install:
```
npm install react-entities
```


## What is an Entity?

An _entity_ is a single-concern data object whose _state_ can be bound to any number of components in the app. In this sense it is a "shared" state. Once bound to a component, an entity's state acts like local state, i.e. it causes the component to update on every change.

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

export interface Counter {
  value: number;
};

export interface CounterActions {
  increment: (by: number) => void;
  decrement: (by: number) => void;
};

export type CounterEntity = Entity<Counter, CounterActions>;

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
</details><br/>   

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


## Recipes

With the very straightforward, largely unopinionated approach that React Entities brings to managing app state, you have full flexibility to implement things the way you want. It works seamlessly with whatever code architecture you choose for your React app. 

Here we provide some suggested patterns that you may consider for specific scenarios.

### Multiple and nested entity scopes

It is simplest to have a single entity scope for all our entities at the top-level component. However, we can have any number of entity scopes, at different levels in our component tree. With nested scopes, entities in the outer scopes are passed down to the inner scopes.

If you attach the same entity to multiple scopes, each scope will propagate a __separate instance__ of the entity, even if you use the same entity ID across these scopes. When used in a component, that ID then refers to the instance at the nearest scope up the hierarchy.

```jsx
const App = () => {
  <EntityScope entities={{ counter, settings }}>
    <Banner />

    <EntityScope entities={{ counter }}>
        <CounterView />
    </EntityScope>
  </EntityScope>
}
```
In our example above, `settings` is accessible to both `<Banner>` and `<CounterView>`, while each of those components will "see" a different `counter`.

