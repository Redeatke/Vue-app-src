# Vue 3 Reactivity Study Guide

> **Topics Covered:** Reactivity Fundamentals · Computed Properties · Watchers

---

## Table of Contents

1. [Reactivity Fundamentals](#1-reactivity-fundamentals)
2. [Computed Properties](#2-computed-properties)
3. [Watchers](#3-watchers)
4. [Quick Reference Table](#4-quick-reference-table)
5. [Quiz Section](#5-quiz-section)

---

## 1. Reactivity Fundamentals

Vue's reactivity system automatically tracks dependencies and updates the DOM when reactive state changes. Vue 3 provides two main APIs: `ref()` and `reactive()`.

### 1.1 `ref()` — For Any Value Type

`ref()` wraps a value in a reactive object. Access the value with `.value` in JavaScript; in templates it auto-unwraps.

```js
import { ref } from 'vue'

const count = ref(0)

console.log(count.value) // 0
count.value++            // triggers DOM update
```

- Works with **primitives** (string, number, boolean) and **objects/arrays**.
- In `<template>`, just use `{{ count }}` — no `.value` needed.

### 1.2 `reactive()` — For Objects & Arrays

`reactive()` makes an entire object deeply reactive. No `.value` needed.

```js
import { reactive } from 'vue'

const state = reactive({
  name: 'Alice',
  age: 25
})

state.age = 26 // triggers DOM update
```

- Only works with **objects and arrays** (not primitives).
- Destructuring breaks reactivity — use `toRefs()` to preserve it.

### 1.3 `ref` vs `reactive`

| Feature         | `ref()`                         | `reactive()`                     |
| --------------- | ------------------------------- | -------------------------------- |
| Value types     | Any (string, number, object...) | Objects and arrays only          |
| Access in `<script>` | `.value`                   | Direct property access           |
| Access in `<template>` | Auto-unwrapped            | Direct property access           |
| Destructuring   | N/A                             | Breaks reactivity (use `toRefs`) |

### 1.4 Full Example

```vue
<script setup>
import { ref, reactive } from 'vue'

const message = ref('Hello Vue!')
const user = reactive({ name: 'John', score: 0 })

function increment() {
  user.score++
}
</script>

<template>
  <p>{{ message }}</p>
  <p>{{ user.name }}'s score: {{ user.score }}</p>
  <button @click="increment">+1</button>
</template>
```

### 1.5 Common Pitfall — Destructuring `reactive`

```js
// ❌ BAD — loses reactivity
let { name, age } = reactive({ name: 'Alice', age: 25 })
name = 'Bob' // NOT reactive

// ✅ GOOD — preserves reactivity
const state = reactive({ name: 'Alice', age: 25 })
const { name, age } = toRefs(state)
name.value = 'Bob' // reactive!
```

---

## 2. Computed Properties

A `computed` property derives a new value from reactive state. It is **cached** and only recalculates when its dependencies change.

### 2.1 Basic Usage

```js
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})
// fullName.value → "John Doe"
```

### 2.2 Computed vs Method

| Feature            | `computed`                        | Method                       |
| ------------------ | --------------------------------- | ---------------------------- |
| Cached?            | ✅ Yes — only re-runs when deps change | ❌ No — runs every render    |
| Best for           | Deriving values from state        | Event handlers / side effects |
| Syntax in template | `{{ myComputed }}`                | `{{ myMethod() }}`           |

### 2.3 Writable Computed

By default, computed properties are **read-only**. To make one writable, provide `get` and `set`:

```js
const count = ref(0)

const doubled = computed({
  get: () => count.value * 2,
  set: (val) => { count.value = val / 2 }
})

doubled.value = 10 // count becomes 5
```

### 2.4 Full Example

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { name: 'Milk', price: 3.50 },
  { name: 'Bread', price: 2.00 },
  { name: 'Eggs', price: 4.25 }
])

const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0)
})

const expensiveItems = computed(() => {
  return items.value.filter(item => item.price > 3)
})
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.name">
      {{ item.name }} — ${{ item.price.toFixed(2) }}
    </li>
  </ul>
  <p><strong>Total:</strong> ${{ total.toFixed(2) }}</p>
  <p><strong>Expensive:</strong> {{ expensiveItems.map(i => i.name).join(', ') }}</p>
</template>
```

### 2.5 Rules for Computed

1. **No side effects** — don't make API calls, mutate other state, or touch the DOM inside a computed.
2. **Don't mutate the computed value** — treat it as read-only (unless using writable computed).
3. **Use for derived data** — filtering, sorting, formatting, calculations.

---

## 3. Watchers

Watchers run **side effects** in response to reactive state changes — API calls, logging, localStorage, etc.

### 3.1 `watch()` — Explicit Source

```js
import { ref, watch } from 'vue'

const query = ref('')

watch(query, (newVal, oldVal) => {
  console.log(`Changed from "${oldVal}" to "${newVal}"`)
})
```

- Must specify **what** to watch.
- Provides both `newVal` and `oldVal`.
- Does **not** run immediately (by default).

### 3.2 `watchEffect()` — Auto-Tracked

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log(`Count is: ${count.value}`)
  // runs immediately, then again whenever count changes
})
```

- Automatically detects which reactive values are used.
- Runs **immediately** on setup.
- Does **not** provide old values.

### 3.3 `watch` vs `watchEffect`

| Feature              | `watch`                              | `watchEffect`               |
| -------------------- | ------------------------------------ | --------------------------- |
| Runs immediately?    | ❌ No (unless `{ immediate: true }`) | ✅ Yes                      |
| Specifies source?    | ✅ Explicit                          | ❌ Auto-detected            |
| Access to old value? | ✅ Yes `(newVal, oldVal)`            | ❌ No                       |
| Best for             | Conditional logic, specific sources  | Simple side effects         |

### 3.4 Watch Options

```js
watch(source, callback, {
  immediate: true,  // run callback right away
  deep: true,       // watch nested object changes
  once: true        // only trigger once (Vue 3.4+)
})
```

### 3.5 Watching Reactive Objects

```js
// ❌ BAD — state.count is just a number, not reactive
const state = reactive({ count: 0 })
watch(state.count, (n) => console.log(n))

// ✅ GOOD — use a getter function
watch(() => state.count, (n) => console.log(n))
```

### 3.6 Deep Watching

```js
const user = ref({ name: 'Alice', settings: { theme: 'dark' } })

watch(user, (newVal) => {
  console.log('User changed:', newVal)
}, { deep: true })
```

Without `{ deep: true }`, changes to nested properties like `user.value.settings.theme` won't trigger the watcher.

### 3.7 Full Example

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const searchQuery = ref('')
const results = ref([])
const debugLog = ref('')

// watch — only search when query is 3+ characters
watch(searchQuery, (newQuery) => {
  if (newQuery.length >= 3) {
    results.value = [`Result for "${newQuery}"`]
  } else {
    results.value = []
  }
})

// watchEffect — auto-tracks both refs
watchEffect(() => {
  debugLog.value = `Query: "${searchQuery.value}", Results: ${results.value.length}`
})
</script>

<template>
  <input v-model="searchQuery" placeholder="Search..." />
  <ul>
    <li v-for="r in results">{{ r }}</li>
  </ul>
  <small>{{ debugLog }}</small>
</template>
```

### 3.8 When to Use Watcher vs Computed

| Use Case                              | Use         |
| ------------------------------------- | ----------- |
| Derive a filtered/sorted list         | `computed`  |
| Format a display value                | `computed`  |
| Fetch data when a param changes       | `watch`     |
| Save to localStorage on change        | `watch`     |
| Log multiple reactive values together | `watchEffect` |

---

## 4. Quick Reference Table

| API             | Import                          | Use Case                                | `.value`? |
| --------------- | ------------------------------- | --------------------------------------- | --------- |
| `ref()`         | `import { ref } from 'vue'`    | Any reactive value                      | Yes       |
| `reactive()`    | `import { reactive } from 'vue'` | Reactive objects/arrays               | No        |
| `computed()`    | `import { computed } from 'vue'` | Cached derived values                 | Yes       |
| `watch()`       | `import { watch } from 'vue'`  | Side effects on specific source changes | N/A       |
| `watchEffect()` | `import { watchEffect } from 'vue'` | Auto-tracked side effects          | N/A       |
| `toRefs()`      | `import { toRefs } from 'vue'` | Destructure reactive without losing reactivity | Yes |

---

## 5. Quiz Section

### Reactivity Fundamentals

**Q1.** What's wrong with this code?
```js
const count = ref(0)
count++
```
> **Answer:** You must use `count.value++`. A `ref` wraps the value in an object — you access and modify it via `.value` in JavaScript.

---

**Q2.** What's the difference between `ref()` and `reactive()`?
> **Answer:**
> - `ref()` can hold **any** value type. You access it with `.value`.
> - `reactive()` only works with **objects/arrays**. You access properties directly (no `.value`).

---

**Q3.** Will this trigger a DOM update? Why or why not?
```js
const state = reactive({ items: ['a', 'b'] })
state.items[2] = 'c'
```
> **Answer:** **Yes!** Vue 3's reactivity system uses `Proxy`, which can detect index-based array mutations (unlike Vue 2).

---

**Q4.** Why does this lose reactivity?
```js
let { name, age } = reactive({ name: 'Alice', age: 25 })
name = 'Bob'
```
> **Answer:** Destructuring breaks the reactive connection. `name` and `age` become plain local variables. Use `toRefs()` to preserve reactivity.

---

### Computed Properties

**Q5.** What's the key advantage of `computed` over a regular method returning the same value?
> **Answer:** **Caching.** A computed property only recalculates when one of its reactive dependencies changes. A method runs every time the component re-renders.

---

**Q6.** Will the computed property update when `count` changes?
```js
const count = ref(5)
const doubled = computed(() => count.value * 2)
```
> **Answer:** **Yes.** `doubled` automatically tracks `count` as a dependency. When `count.value` changes, `doubled` recalculates.

---

**Q7.** What's wrong here?
```js
const count = ref(0)
const doubled = computed(() => count.value * 2)
doubled.value = 10
```
> **Answer:** Computed properties are **read-only** by default. You'd need a writable computed with `get` and `set`.

---

**Q8.** Why should you avoid side effects inside a computed?
> **Answer:** Computed properties are meant for **pure derivations**. Fetching data or modifying other state inside a computed is unpredictable because Vue controls when it re-evaluates. Use a **watcher** for side effects instead.

---

### Watchers

**Q9.** What's the difference between `watch` and `watchEffect`?
> **Answer:**
> - `watch` requires you to explicitly specify what to watch, gives you old + new values, and does NOT run immediately by default.
> - `watchEffect` automatically tracks any reactive dependency used inside it, runs immediately, but does NOT give you old values.

---

**Q10.** How do you make a `watch` run immediately on setup?
> **Answer:** Pass `{ immediate: true }` as the third argument:
> ```js
> watch(source, (newVal, oldVal) => { ... }, { immediate: true })
> ```

---

**Q11.** Why doesn't this watcher fire when `user.name` changes?
```js
const user = reactive({ name: 'Alice' })
watch(user.name, (newVal) => {
  console.log(newVal)
})
```
> **Answer:** `user.name` evaluates to the string `'Alice'` — not a reactive source. You must pass a **getter function**: `watch(() => user.name, ...)`

---

**Q12.** When should you use a **watcher** vs a **computed**?
> **Answer:**
> - **Computed** → derive a value from state (pure, no side effects).
> - **Watch / watchEffect** → perform side effects in response to changes (API calls, logging, etc.).

---

**Q13.** What does `{ deep: true }` do in a watcher?
> **Answer:** It tells Vue to recursively watch all nested properties of an object. Without it, changes to nested properties won't trigger the watcher when watching a `ref` holding an object.

---

### Mixed / Scenario-Based

**Q14.** For each scenario, which API would you use?

| Scenario                                | Answer         |
| --------------------------------------- | -------------- |
| A simple counter                        | `ref`          |
| A form with multiple fields             | `reactive`     |
| Calculating a filtered list from data   | `computed`     |
| Saving to localStorage when state changes | `watch`      |
| Logging the current value of multiple refs | `watchEffect` |

---

**Q15.** What will this output?
```js
const a = ref(1)
const b = ref(2)
const sum = computed(() => a.value + b.value)
console.log(sum.value) // ?
a.value = 10
console.log(sum.value) // ?
```
> **Answer:** `3` then `12`. The computed recalculates when `a` changes.

---

**Q16.** Fix this code so the watcher works:
```js
const state = reactive({ count: 0 })
watch(state.count, (n) => console.log(n))
```
> **Answer:**
> ```js
> watch(() => state.count, (n) => console.log(n))
> ```
> Wrap it in a getter function — `state.count` alone is just a number, not a reactive source.
