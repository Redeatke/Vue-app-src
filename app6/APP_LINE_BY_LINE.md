# Starfish App — Line-by-Line Breakdown

Every file, every function, every directive explained.

---

# 📄 `main.js` — App Entry Point

```js
import { createApp } from 'vue'          // Vue's factory function to create an app
import { createPinia } from 'pinia'      // Pinia's factory to create the store system

import App from './App.vue'              // Root component
import router from './router'            // Our router config

const app = createApp(App)               // Create the Vue app with App.vue as root

app.use(createPinia())                   // Install Pinia plugin — enables stores
app.use(router)                          // Install Vue Router — enables routing

app.mount('#app')                        // Mount to <div id="app"> in index.html
```

**Order matters** — Pinia and Router must be installed with `.use()` BEFORE `.mount()`.

---

# 📄 `App.vue` — Root Shell

### Script
```js
import NavBar from '@/components/NavBar.vue'      // @ = shortcut for /src/
import FooterView from '@/components/FooterView.vue'
```
Just imports the two layout components. No logic needed here.

### Template
```html
<div class="app">
  <NavBar />                   <!-- Always visible top bar -->
  <RouterView class="view" />  <!-- This is where the current route's component renders -->
  <FooterView />               <!-- Always visible bottom bar -->
</div>
```
- **`<RouterView />`** — a Vue Router built-in component. It renders whatever component matches the current URL. Visit `/login` → renders `LoginView`. Visit `/about` → renders `AboutView`. The NavBar and Footer wrap around it, so they're always on screen.

### CSS — The Starfish Watermark
```css
.app {
  height: 100vh;              /* Full viewport height */
  width: 100vw;               /* Full viewport width */
  box-sizing: border-box;     /* Padding included in width/height */
  padding: 20px;              /* Space around edges (creates the blue border look) */
  display: flex;
  flex-direction: column;     /* Stack children vertically: NavBar → View → Footer */
}

.view {
  position: relative;         /* Needed so ::after can position inside it */
}

.view::after {
  position: absolute;         /* Sits on top of .view, positioned relative to it */
  top: 0; left: 0;
  width: 100%; height: 100%;  /* Covers the entire view area */
  content: '';                /* Required for pseudo-elements to render */
  background-image: url(/starfish.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;   /* Fits inside without cropping */
  filter: grayscale(100%);    /* Removes color → gray */
  opacity: 0.05;              /* 5% visible = very faint watermark */
  z-index: -1;                /* Behind all content */
}
```
**`::after`** is a CSS pseudo-element — it creates an invisible "child" element. Here it acts as a background layer for the starfish image without adding actual HTML.

---

# 📄 `router/index.js` — Route Definitions

```js
import { createRouter, createWebHistory } from 'vue-router'
```
- **`createRouter`** — creates the router instance
- **`createWebHistory`** — uses the browser's History API for clean URLs (`/login` not `/#/login`)

```js
const router = createRouter({
  history: createWebHistory('/'),     // '/' = base URL path
  routes: [
    { path: '/', redirect: '/login' },
```
- **`redirect`** — visiting `/` instantly sends to `/login`, no component renders at `/`

```js
    { path: '/login', name: 'login', component: LoginView },
```
- **`name: 'login'`** — a named route, lets you link with `{ name: 'login' }` instead of hardcoded path

```js
    { path: '/home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
```

```js
    { path: '/:pathMatch(.*)*', component: NotFoundView }
```
- **`/:pathMatch(.*)*`** — a regex catch-all. `(.*)` matches any character, `*` makes it match multiple path segments. `/anything/here/at/all` → shows NotFoundView.

---

# 📄 `stores/user.js` — Pinia Store

```js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore('userStore', () => ({
  user: reactive({
    username: localStorage.getItem('username')
  })
}))
```

- **`defineStore('userStore', ...)`** — `'userStore'` is the unique ID
- **Setup style** — the function returns an object with reactive state
- **`reactive({...})`** — makes the `user` object reactive. When `user.username` changes, any component reading it auto-updates
- **`localStorage.getItem('username')`** — reads from browser storage on init. Returns `null` if nothing was saved

### How it's used across the app:

| Component | What it does with the store |
|---|---|
| **LoginView** | Sets `store.user.username` and saves to localStorage |
| **NavBar** | Reads `store.user.username` to decide which links to show |
| **HomeView** | Reads `store.user.username` for the welcome message |
| **NavBar (logout)** | Sets `store.user.username = null` and clears localStorage |

---

# 📄 `utils/validators.js` — Validation Rules

### Structure
Each rule is an object:
```js
{
  name: 'minLength',                    // Internal name (not displayed)
  test: (v) => v.length >= 5,           // Function that returns true/false
  errorMessage: 'Must have at least 5 characters'  // Shown when test FAILS
}
```

### Username Rules
| Rule | Regex/Test | What it checks |
|---|---|---|
| Min 5 chars | `v.length >= 5` | At least 5 characters |
| Max 16 chars | `v.length <= 16` | No more than 16 characters |
| Starts with letter | `/^[a-zA-Z]/` | `^` = start, `[a-zA-Z]` = any letter |
| Only alphanumeric | `/^[a-zA-Z0-9]+$/` | `+` = one or more, `$` = end of string |

### Password Rules
| Rule | Regex/Test | What it checks |
|---|---|---|
| Min 8 chars | `v.length >= 8` | At least 8 characters |
| Max 64 chars | `v.length <= 64` | No more than 64 characters |
| Has uppercase | `/[A-Z]/` | Any capital letter exists |
| Has lowercase | `/[a-z]/` | Any lowercase letter exists |
| Has number | `/[0-9]/` | Any digit exists |
| Has special char | `/[!@#$%^&*(),.?":{}|<>]/` | Any of these special chars exists |

### The validate functions
```js
export function validateUsername(username) {
  const errors = []
  for (const rule of usernameRules) {    // Loop through each rule
    if (!rule.test(username)) {          // If the test FAILS
      errors.push(rule.errorMessage)     // Add error message to the list
    }
  }
  return errors   // Returns array of failing messages (empty = all passed!)
}
```

---

# 📄 `LoginView.vue` — The Login Page

### Script — Imports & Setup
```js
import { ref, computed, useTemplateRef } from 'vue'
```
- **`ref`** — creates a reactive variable (for primitives)
- **`computed`** — creates a derived value that auto-updates
- **`useTemplateRef`** — gets a direct reference to a DOM element

```js
const username = ref('')            // Bound to username input via v-model
const password = ref('')            // Bound to password input via v-model
const passwordInput = useTemplateRef('passwordInput')  // Direct access to the <input> DOM element
```

### Script — Computed Properties (Reactive Validation)
```js
const usernameErrors = computed(() => validateUsername(username.value))
const passwordErrors = computed(() => validatePassword(password.value))
```
**Every time the user types a character**, `username.value` changes → Vue re-runs this computed → new error list → template updates. This is what makes the validation "real-time".

```js
const subtitle = computed(() =>
  store.user.username ? 'Login with another account' : 'Enter your credentials'
)
```
If someone is already logged in (username in store), shows different text.

### Script — Password Toggle
```js
function togglePassword(event) {
  const target = event.target              // The checkbox that was clicked
  passwordInput.value.type = target.checked ? 'text' : 'password'
}
```
- **`event.target`** — the DOM element that triggered the event (the checkbox inside ToggleSwitch)
- **`passwordInput.value`** — the actual `<input>` DOM element (via `useTemplateRef`)
- Switches `type="password"` (shows dots) to `type="text"` (shows characters)

### Script — Login Function
```js
function login() {
  if (usernameErrors.value.length == 0 && passwordErrors.value.length == 0) {
    localStorage.setItem('username', username.value)   // Save to browser storage
    store.user.username = username.value                // Update Pinia (triggers NavBar update)
    router.push('/home')                                // Navigate programmatically
  }
  // If errors exist, nothing happens — the errors are already displayed
}
```

### Template — Key Directives

```html
<input id="usernameInput" v-model="username" />
```
- **`v-model`** — two-way binding. Input value ↔ `username` ref. Typing updates the ref, changing the ref updates the input.

```html
<ToggleSwitch class="align-right" @change="togglePassword" />
```
- **`@change`** — listens for the `change` event from the checkbox inside ToggleSwitch

```html
<input type="password" ref="passwordInput" @keyup.enter="login" />
```
- **`ref="passwordInput"`** — links this element to `useTemplateRef('passwordInput')`
- **`@keyup.enter`** — calls `login()` when Enter key is released (key modifier)

```html
<div class="error-messages"
     :class="{ 'no-width': passwordErrors.length == 0 && usernameErrors.length == 0 }">
```
- **`:class`** — dynamic class binding. Adds `no-width` class when both error arrays are empty.

```html
<div v-show="usernameErrors.length > 0">
```
- **`v-show`** — toggles `display: none`. Element stays in DOM but becomes invisible. (vs `v-if` which removes from DOM entirely)

```html
<li v-for="msg in usernameErrors" :key="msg">
```
- **`v-for`** — loops through the error array, creating one `<li>` per error
- **`:key`** — required by Vue for efficient DOM updates, must be unique per item

### CSS — The Sliding Error Panel Animation

```css
.error-messages {
  width: 200px;                       /* Normal width when errors exist */
  transition: width 1s linear;        /* Any width change animates over 1 second */
  display: flex;
  flex-direction: column;
  justify-content: center;            /* Vertically centers the error text */
}

.no-width {
  width: 0;                           /* Collapses to nothing */
}
```

**How the animation works:**
1. Initially, `no-width` is applied (both arrays empty) → width is `0`
2. User starts typing → errors appear → `no-width` is REMOVED → width transitions from `0` to `200px` over 1 second → **slides in**
3. User fixes all errors → both arrays empty → `no-width` is ADDED → width transitions from `200px` to `0` → **slides out**

```css
.error-messages span {
  display: inline-block;
  min-width: max-content;    /* Prevents text from wrapping during animation */
  white-space: nowrap;        /* Forces text on one line */
}
```
Without these, the text would squish and wrap awkwardly as the width shrinks.

### CSS — Button Press Effect
```css
.login-form > button:active {
  transform: scale(97%);     /* Shrinks slightly when clicked/held */
}
```
**`:active`** is the CSS state while the mouse button is physically pressed down.

---

# 📄 `NavBar.vue` — Top Navigation Bar

### Script
```js
const isLoggedIn = computed(() => store.user.username !== null)
```
True if Pinia store has a username (not null).

```js
const showLoginLink = computed(() => !isLoggedIn.value && route.path !== '/login')
```
Show "Log in" link only when: NOT logged in AND not already on the login page.

```js
const showLogoutLink = computed(() => isLoggedIn.value && route.path !== '/login')
```
Show "Log out" only when: logged in AND not on the login page.

```js
function logout() {
  localStorage.removeItem('username')    // Clear from browser storage
  store.user.username = null             // Clear Pinia state → triggers all computed updates
  router.push('/login')                  // Navigate to login
}
```

### Template
```html
<RouterLink :class="[{ hidden: !isLoggedIn }, 'link']" to="/home">Home</RouterLink>
```
- **`<RouterLink>`** — Vue Router component, renders as `<a>` tag but uses client-side navigation (no page reload)
- **`:class` with array syntax** — applies `'link'` always, applies `'hidden'` conditionally when not logged in
- The Home link is always in the DOM but invisible when logged out (`visibility: hidden` keeps its space)

```html
<RouterLink v-show="showLoginLink" to="/login" class="link">Log in</RouterLink>
```
- **`v-show`** — toggles visibility via CSS `display`

### CSS — Active Link Highlighting
```css
.router-link-active {
  background-color: gray;
  color: #fff;
  transition: background-color 0.25s ease-in, color 0s ease-in 0.25s;
}
```
- **`.router-link-active`** — Vue Router automatically adds this class to any `<RouterLink>` whose `to` matches the current URL
- The transition makes the background fade to gray over 0.25s, then the text color changes to white after a 0.25s delay

---

# 📄 `FooterView.vue` — Bottom Bar

```html
<RouterLink :to="{ name: 'about' }" class="link">About</RouterLink>
```
- **`:to="{ name: 'about' }"`** — navigates using the route's *name* instead of hardcoded path. If you ever changed `/about` to `/info`, this link would still work.
- Gets `.router-link-active` class automatically when on the About page

---

# 📄 `ToggleSwitch.vue` — Password Toggle

### Template
```html
<label class="switch">
  <input type="checkbox" />     <!-- Hidden checkbox (opacity: 0) -->
  <span class="slider"></span>  <!-- The visible slider track -->
</label>
```
The actual checkbox is invisible — it's still there for accessibility and click handling, but the visual toggle is the styled `<span>`.

### CSS — How the Slider Works
```css
.slider:before {                    /* The circular knob */
  position: absolute;
  content: '';                      /* Creates the pseudo-element */
  height: 13px; width: 14px;
  left: 2px; bottom: 2px;          /* Positioned at left side */
  background-color: #fff;
  transition: 0.4s;                /* Smooth slide animation */
  border-radius: 50%;              /* Makes it circular */
}

input:checked + .slider {          /* When checkbox is checked... */
  background-color: #2196f3;       /* Track turns blue */
}

input:checked + .slider:before {   /* When checked... */
  transform: translate(13px);      /* Knob slides 13px to the right */
}
```
- **`input:checked + .slider`** — the `+` is the adjacent sibling selector. "When the input before the slider is checked, style the slider"
- The `transition: 0.4s` on `.slider:before` makes the knob glide smoothly

---

# 📄 `HomeView.vue` — Welcome Page

```js
const welcomeName = computed(() => {
  if (store.user.username) {
    const name = store.user.username
    return name.charAt(0).toUpperCase() + name.slice(1)   // Capitalizes first letter
  } else {
    router.push('/login')    // If no username, redirect to login
  }
})
```
- **`charAt(0).toUpperCase()`** — gets first character and capitalizes it
- **`slice(1)`** — gets everything after the first character
- Example: `"testuser"` → `"T" + "estuser"` → `"Testuser"`

---

# 📄 `AboutView.vue` & `NotFoundView.vue`

Both are simple static pages with just a heading and the same background styling:

```css
background-color: #efeded;    /* Light gray */
opacity: 97%;
flex: 1;                      /* Stretches to fill available vertical space */
```
- **`flex: 1`** — since `App.vue` uses `flex-direction: column`, this makes the view expand to fill the space between NavBar and Footer
