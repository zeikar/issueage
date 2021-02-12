<script lang="ts">
  import { onMount } from "svelte";

  export let websiteTitle;
  let scrolled = false;

  function navbarShadow() {
    if (window.pageYOffset > 0) {
      scrolled = true;
    } else {
      scrolled = false;
    }
  }

  onMount(() => {
    window.addEventListener("scroll", navbarShadow);
  });
</script>

<nav
  class:has-shadow={scrolled}
  class="navbar is-fixed-top animated-shadow"
  role="navigation"
  aria-label="main navigation"
>
  <div class="container">
    <div class="navbar-brand">
      <a href="." class="navbar-item"><h1 class="title">{websiteTitle}</h1></a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <a href="." class="navbar-item"> menu here </a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field has-addons">
            <div class="control">
              <input
                class="input is-rounded"
                type="search"
                placeholder="search"
              />
            </div>
            <div class="control">
              <button class="button is-rounded">
                <span class="icon is-small"> <i class="fas fa-search" /> </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  .animated-shadow {
    transition: all 0.5s;
  }
</style>
