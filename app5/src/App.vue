<script setup>
</script>

<template>
    <div class="app">
        <nav>
            <RouterLink to="/">Home</RouterLink>
            &nbsp;&nbsp;
            <RouterLink to="/messenger">Messenger</RouterLink>
        </nav>
        <main>
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.app {
    height: 100vh;
    width: 100vw;
    background-color: gray;
    box-sizing: border-box;
   
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', sans-serif;
}
nav {
    background-color: #dcdcdc;
    padding: 14px 20px;
    border-bottom: 2px solid #ccc;
}
nav a {
    color: #444;
    text-decoration: none;
    font-weight: 600;
    padding: 4px 0;
}
nav a:hover {
    color: #111;
    text-decoration: underline;
}
nav a.router-link-active {
    color: #2c6fbb;
}
main {
    background-color: #dcdcdc;
    padding: 20px;
    flex-grow: 1;
}
</style>
