# Pinia Cheat Sheet & Study Guide

---

## What is Pinia?

Pinia is the **official state management library** for Vue. It lets you share data (state) between components without passing props up and down. Think of it as a global, reactive data container.

---

## Installing & Setting Up

```js
// main.js
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(createPinia())   // Install Pinia plugin
app.mount('#app')
```

---

## Defining a Store

There are **two styles** — know both:

### Option Store (Options API style)

```js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({          // ← data (like data() in components)
    count: 0,
    name: 'My Counter'
  }),
  getters: {               // ← computed values (like computed)
    doubleCount: (state) => state.count * 2,
    // Can access other getters via `this`
    doubleCountPlusOne() {
      return this.doubleCount + 1
    }
  },
  actions: {               // ← methods (like methods, CAN be async)
    increment() {
      this.count++         // Use `this` to access state
    },
    async fetchData() {
      const data = await fetch('/api/data')
      this.name = data.name
    }
  }
})
```

### Setup Store (Composition API style)

```js
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // ref() → state
  const count = ref(0)
  const name = ref('My Counter')

  // computed() → getters
  const doubleCount = computed(() => count.value * 2)

  // functions → actions
  function increment() {
    count.value++
  }

  // Must return everything you want to expose
  return { count, name, doubleCount, increment }
})
```

### Key Differences

| | Option Store | Setup Store |
|---|---|---|
| State | `state: () => ({})` | `ref()` or `reactive()` |
| Getters | `getters: {}` | `computed()` |
| Actions | `actions: {}` | Regular functions |
| Access state | `this.count` | `count.value` |
| Return | Automatic | Must explicitly return |

---

## Using a Store in Components

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()

// Access state directly
console.log(store.count)        // 0
console.log(store.doubleCount)  // 0 (getter)

// Call actions
store.increment()

// WRONG — don't destructure reactive state:
const { count } = store  // ❌ Loses reactivity!

// RIGHT — use storeToRefs for destructuring:
import { storeToRefs } from 'pinia'
const { count, name } = storeToRefs(store)  // ✅ Still reactive
// But actions can be destructured normally:
const { increment } = store  // ✅ Fine for functions
</script>

<template>
  <!-- Use store directly in template — fully reactive -->
  <p>{{ store.count }}</p>
  <p>{{ store.doubleCount }}</p>
  <button @click="store.increment()">+1</button>
</template>
```

---

## `ref()` vs `reactive()`

```js
// ref — wraps a single value, access with .value
const count = ref(0)
count.value++

// reactive — wraps an object, access properties directly
const user = reactive({ name: 'Alice', age: 25 })
user.name = 'Bob'  // no .value needed
```

| | `ref()` | `reactive()` |
|---|---|---|
| Use for | Primitives + objects | Objects only |
| Access in JS | `.value` | Direct property access |
| Access in template | Auto-unwrapped (no `.value`) | Direct property access |
| Can reassign? | Yes (`count.value = 5`) | No (can't replace whole object) |

---

## Modifying State

### Direct mutation
```js
store.count++
store.user.name = 'Bob'
```

### Using `$patch` (batch multiple changes)
```js
// Object syntax
store.$patch({ count: 5, name: 'New Name' })

// Function syntax (better for arrays/complex changes)
store.$patch((state) => {
  state.count++
  state.items.push({ name: 'new item' })
})
```

### Using `$reset()` (Option stores only)
```js
store.$reset()  // Resets state to initial values
```

---

## Subscribing to Changes

```js
// Watch for state changes
store.$subscribe((mutation, state) => {
  // Runs whenever state changes
  localStorage.setItem('cart', JSON.stringify(state))
})

// Watch for action calls
store.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} called with`, args)
  after((result) => console.log('Finished with', result))
  onError((error) => console.error('Failed', error))
})
```

---

## Pinia + localStorage Pattern (as used in Starfish app)

```js
export const useUserStore = defineStore('userStore', () => ({
  user: reactive({
    username: localStorage.getItem('username')   // Load on init
  })
}))

// In component — save on login:
localStorage.setItem('username', username.value)
store.user.username = username.value

// In component — clear on logout:
localStorage.removeItem('username')
store.user.username = null
```

---

## Quick Reference — `defineStore()` Parameters

```js
defineStore(
  'storeId',     // 1st arg: unique string ID (required)
  {/* options */} // 2nd arg: options object OR setup function
)
```

- The **ID** must be unique across your app
- Convention: name the function `useXxxStore` (e.g., `useUserStore`, `useCartStore`)
- The store is only created once, then shared across all components that call it

---

## Common Gotchas

1. **Don't destructure state** — use `storeToRefs()` or access via `store.xxx`
2. **`$reset()` only works with Option stores** — not Setup stores
3. **Store ID must be unique** — two stores can't share the same ID string
4. **Pinia must be installed before using stores** — `app.use(createPinia())` must come before `app.mount()`
5. **`reactive()` objects can't be reassigned** — you can change properties but not replace the whole object
