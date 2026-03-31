# Pinia Practice Quiz

---

## Part 1: Conceptual Questions

### Q1. What does `defineStore()` return?
<details><summary>Answer</summary>

It returns a **composable function** (e.g., `useCounterStore`). When you call that function in a component, it gives you access to the store's state, getters, and actions. The store is created once and shared — every component calling `useCounterStore()` gets the same instance.
</details>

---

### Q2. What's wrong with this code?

```js
const store = useCounterStore()
const { count, name } = store

// In template: {{ count }}
```

<details><summary>Answer</summary>

**Destructuring loses reactivity.** `count` and `name` become plain, non-reactive variables. The template won't update when the store changes.

Fix — use `storeToRefs()`:
```js
import { storeToRefs } from 'pinia'
const { count, name } = storeToRefs(store)
```
</details>

---

### Q3. What's the difference between `state`, `getters`, and `actions` in a Pinia option store?

<details><summary>Answer</summary>

- **`state`** = reactive data (like `data()` in components). Always a function returning an object.
- **`getters`** = computed/derived values from state (like `computed`). Receive `state` as first param, or use `this` for other getters.
- **`actions`** = methods that can modify state (like `methods`). Can be async. Use `this` to access state.
</details>

---

### Q4. Translate this Option store to a Setup store:

```js
export const useTodoStore = defineStore('todos', {
  state: () => ({
    items: [],
    filter: 'all'
  }),
  getters: {
    activeItems: (state) => state.items.filter(i => !i.done),
    activeCount() { return this.activeItems.length }
  },
  actions: {
    addItem(text) {
      this.items.push({ text, done: false })
    }
  }
})
```

<details><summary>Answer</summary>

```js
import { ref, computed } from 'vue'

export const useTodoStore = defineStore('todos', () => {
  const items = ref([])
  const filter = ref('all')

  const activeItems = computed(() => items.value.filter(i => !i.done))
  const activeCount = computed(() => activeItems.value.length)

  function addItem(text) {
    items.value.push({ text, done: false })
  }

  return { items, filter, activeItems, activeCount, addItem }
})
```

Key differences:
- `state` → `ref()`
- `getters` → `computed()`
- `actions` → regular functions
- Must `return` everything
- Use `.value` to access refs in JS
</details>

---

### Q5. When would you use `reactive()` vs `ref()` in a setup store?

<details><summary>Answer</summary>

- **`ref()`** — for primitives (`string`, `number`, `boolean`) or when you might reassign the whole value
- **`reactive()`** — for objects where you only modify properties, never reassign the whole object

Example:
```js
const count = ref(0)          // ref for a number
const user = reactive({       // reactive for an object
  username: null,
  email: null
})
```

`reactive()` objects can't be reassigned (`user = {...}` breaks reactivity), but properties can be changed (`user.username = 'Bob'` works).
</details>

---

### Q6. What does `$patch()` do and why might you use it?

<details><summary>Answer</summary>

`$patch()` lets you **change multiple state properties at once** in a single mutation:

```js
// Object syntax — merges properties
store.$patch({ count: 5, name: 'Updated' })

// Function syntax — needed for array operations
store.$patch((state) => {
  state.items.push(newItem)
  state.count++
})
```

It's more efficient than mutating one property at a time because it triggers a single reactivity update.
</details>

---

### Q7. How does Pinia know which store you're asking for when you call `useCounterStore()`?

<details><summary>Answer</summary>

By the **unique string ID** (first argument to `defineStore()`):

```js
defineStore('counter', { ... })  // 'counter' is the ID
```

Pinia uses this ID to register and look up the store instance internally. Every store must have a unique ID.
</details>

---

## Part 2: Coding Exercises

### Exercise 1: Create a Shopping Cart Store

Create a Pinia store called `useCartStore` with:
- State: `items` (array) and `taxRate` (number, default 0.08)
- Getter: `totalPrice` that sums all `item.price * item.quantity`
- Getter: `totalWithTax` that applies the tax rate
- Action: `addItem(product)` that pushes to items or increments quantity if already exists
- Action: `removeItem(productId)` that removes an item by id

<details><summary>Answer (Setup style)</summary>

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const taxRate = ref(0.08)

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const totalWithTax = computed(() =>
    totalPrice.value * (1 + taxRate.value)
  )

  function addItem(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex(i => i.id === productId)
    if (index > -1) items.value.splice(index, 1)
  }

  return { items, taxRate, totalPrice, totalWithTax, addItem, removeItem }
})
```
</details>

---

### Exercise 2: Use a Store in a Component

Given this store:
```js
export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const isLoggedIn = computed(() => token.value !== null)
  function login(newToken) { token.value = newToken }
  function logout() { token.value = null }
  return { token, isLoggedIn, login, logout }
})
```

Write a Vue component `<LoginStatus>` that:
- Shows "Welcome!" and a Logout button when logged in
- Shows "Please log in" and a Login button when not logged in
- Login button should call `login('abc123')`

<details><summary>Answer</summary>

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isLoggedIn">
    <p>Welcome!</p>
    <button @click="auth.logout()">Logout</button>
  </div>
  <div v-else>
    <p>Please log in</p>
    <button @click="auth.login('abc123')">Login</button>
  </div>
</template>
```
</details>

---

### Exercise 3: Store with localStorage Persistence

Create a `useThemeStore` that:
- Has a `theme` state (`'light'` or `'dark'`)
- Loads the saved theme from `localStorage` on init (default to `'light'`)
- Has a `toggleTheme()` action that switches between light/dark and saves to `localStorage`
- Has an `isDark` getter

<details><summary>Answer</summary>

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  }

  return { theme, isDark, toggleTheme }
})
```
</details>

---

### Exercise 4: What's the output?

```js
// store.js
export const useStore = defineStore('test', {
  state: () => ({ count: 10 }),
  getters: {
    doubled: (state) => state.count * 2,
    quadrupled() { return this.doubled * 2 }
  },
  actions: {
    addFive() { this.count += 5 }
  }
})

// Component:
const store = useStore()
console.log(store.count)        // ?
console.log(store.doubled)      // ?
store.addFive()
console.log(store.count)        // ?
console.log(store.quadrupled)   // ?
```

<details><summary>Answer</summary>

```
10        // Initial state
20        // 10 * 2
15        // 10 + 5
60        // doubled = 15 * 2 = 30, quadrupled = 30 * 2 = 60
```
</details>

---

### Exercise 5: Fix the Bugs

This store has 3 bugs. Find and fix them:

```js
import { defineStore } from 'pinia'

export const useNoteStore = defineStore(() => {
  const notes = reactive([])

  const noteCount = computed(() => notes.length)

  function addNote(text) {
    notes.push({ text, id: Date.now() })
  }

  function deleteNote(id) {
    notes = notes.filter(n => n.id !== id)
  }
})
```

<details><summary>Answer</summary>

**Bug 1:** `defineStore` is missing the store ID string (first argument).
**Bug 2:** `reactive` and `computed` are not imported from Vue.
**Bug 3:** `deleteNote` reassigns `notes` — you can't reassign a `reactive()` object. Use `splice` instead. Also, nothing is returned.

Fixed:
```js
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export const useNoteStore = defineStore('notes', () => {
  const notes = reactive([])

  const noteCount = computed(() => notes.length)

  function addNote(text) {
    notes.push({ text, id: Date.now() })
  }

  function deleteNote(id) {
    const index = notes.findIndex(n => n.id === id)
    if (index > -1) notes.splice(index, 1)
  }

  return { notes, noteCount, addNote, deleteNote }
})
```
</details>
