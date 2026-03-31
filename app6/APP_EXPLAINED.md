# Starfish App — How Everything Works

---

## 🔀 Vue Router (`router/index.js`)

Uses **`createWebHistory('/')`** for clean URLs (no `#` hashes). Defines 4 routes:

```js
{ path: '/', redirect: '/login' }              // Root auto-redirects to login
{ path: '/login', name: 'login', component: LoginView }
{ path: '/home', component: HomeView }
{ path: '/about', name: 'about', component: AboutView }
{ path: '/:pathMatch(.*)*', component: NotFoundView }  // Catch-all 404
```

- **`redirect: '/login'`** — visiting `/` automatically sends you to `/login`
- **`name: 'login'`** / **`name: 'about'`** — named routes let you link with `{ name: 'about' }` instead of hardcoding paths
- **`/:pathMatch(.*)*`** — wildcard catch-all, matches any URL not defined above → shows 404 page
- **Programmatic navigation**: `router.push('/home')` in LoginView after login
- **Declarative navigation**: `<RouterLink to="/login">` in NavBar/Footer

---

## 🏪 Pinia Store (`stores/user.js`)

```js
export const useUserStore = defineStore('userStore', () => ({
  user: reactive({ username: localStorage.getItem('username') })
}))
```

- **Composition API** style store (function, not options object)
- **`reactive()`** makes `user.username` reactive — components auto-update when it changes
- **`localStorage.getItem('username')`** — checks for a saved username from a previous session on app load
- Used by multiple components:
  - **LoginView** — sets `store.user.username` on login
  - **NavBar** — reads it to decide which links to show
  - **HomeView** — reads it for the welcome message

---

## ✅ Validation & Error Panel (`LoginView.vue` + `validators.js`)

### Validation Rules

Each rule has a `test` function and an `errorMessage`:

```js
// Username rules:
- Must have at least 5 characters        → v.length >= 5
- Cannot exceed 16 characters            → v.length <= 16
- Must begin with a letter               → /^[a-zA-Z]/.test(v)
- Can only contain letters and numbers   → /^[a-zA-Z0-9]+$/.test(v)

// Password rules:
- Must have at least 8 characters        → v.length >= 8
- Cannot exceed 64 characters            → v.length <= 64
- Must have 1 uppercase character        → /[A-Z]/.test(v)
- Must have 1 lowercase character        → /[a-z]/.test(v)
- Must have 1 number                     → /[0-9]/.test(v)
- Must have 1 special character          → /[!@#$%^&*(),.?":{}|<>]/.test(v)
```

`validateUsername()` and `validatePassword()` loop through rules and return **only the failing** error messages.

### Real-Time Reactivity

```js
const usernameErrors = computed(() => validateUsername(username.value))
const passwordErrors = computed(() => validatePassword(password.value))
```

These are **computed properties** — every keystroke updates `username`/`password` via `v-model`, which triggers re-validation instantly.

### Slide-In / Slide-Out Animation

Done with **CSS width transition**:

```css
.error-messages {
  width: 200px;
  transition: width 1s linear;   /* Animates width over 1 second */
}
.no-width {
  width: 0;                       /* Collapses panel */
}
```

```html
<div class="error-messages"
     :class="{ 'no-width': passwordErrors.length == 0 && usernameErrors.length == 0 }">
```

- **All validations pass** → both arrays empty → `no-width` added → width transitions `200px → 0` → panel slides away
- **Any validation fails** → `no-width` removed → width transitions `0 → 200px` → panel slides in
- Text doesn't wrap during animation because of `min-width: max-content; white-space: nowrap;`

---

## 🔐 Login Flow

1. User types → `v-model` binds inputs to `ref()` variables
2. `computed` properties re-run validators on every keystroke
3. Passing rules disappear, failing rules stay visible
4. Click **"Log in"**:

```js
if (usernameErrors.value.length == 0 && passwordErrors.value.length == 0) {
  localStorage.setItem('username', username.value)  // Save to browser
  store.user.username = username.value               // Update Pinia store
  router.push('/home')                               // Navigate to home
}
```

Only succeeds if **both** error arrays are empty.

---

## 🔑 Password Toggle (`ToggleSwitch.vue`)

CSS-only slider switch (no JS inside the component). When toggled, LoginView handles it:

```js
function togglePassword(event) {
  passwordInput.value.type = target.checked ? 'text' : 'password'
}
```

Switches input type between `password` (dots) and `text` (visible). `useTemplateRef('passwordInput')` gives direct DOM access to the input.

---

## 🧭 NavBar Conditional Links (`NavBar.vue`)

```js
const isLoggedIn = computed(() => store.user.username !== null)
const showLoginLink = computed(() => !isLoggedIn.value && route.path !== '/login')
const showLogoutLink = computed(() => isLoggedIn.value && route.path !== '/login')
```

| Link | When Visible |
|------|-------------|
| **Home** | Always present, but `visibility: hidden` when not logged in |
| **Log in** | Not logged in AND not already on `/login` |
| **Log out** | Logged in AND not on `/login` |

Logout clears `localStorage` and resets the Pinia store, then navigates to `/login`.

---

## 🌊 Starfish Watermark (`App.vue`)

```css
.view::after {
  background-image: url(/starfish.png);
  filter: grayscale(100%);
  opacity: 0.05;
  z-index: -1;
}
```

- **`::after` pseudo-element** — positioned absolutely behind all content
- **`grayscale(100%)`** — desaturates the colorful starfish image
- **`opacity: 0.05`** — makes it 5% visible (very subtle watermark)
- **`z-index: -1`** — sits behind all page content

---

## 📁 File Structure

```
app6/src/
├── main.js                  # App entry — creates Vue app, installs Pinia + Router
├── App.vue                  # Root shell — NavBar + RouterView + Footer + watermark
├── router/
│   └── index.js             # Route definitions
├── stores/
│   └── user.js              # Pinia store for username
├── utils/
│   └── validators.js        # Username/password validation rules
├── components/
│   ├── NavBar.vue           # Top nav with conditional links
│   ├── FooterView.vue       # Bottom bar with About link
│   └── ToggleSwitch.vue     # CSS-only password toggle
└── views/
    ├── LoginView.vue        # Login form + validation
    ├── HomeView.vue         # Welcome page
    ├── AboutView.vue        # About page
    └── NotFoundView.vue     # 404 page
```
