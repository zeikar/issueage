<script lang="ts">
  import Navbar from "./components/common/navbar.svelte";

  export let name: string;
</script>

<Navbar />
<div class="container">
  <h1>Hello {name}!</h1>
  <p>
    Visit the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
</div>
