<script lang="ts">
  import { onMount } from "svelte";
  import { link, querystring, push } from "svelte-spa-router";
  import { getSearchLink } from "../../lib/links";

  export let websiteTitle;
  let scrolled = false;
  let search = "";
  let navbarOpen = false;

  function navbarShadow() {
    if (window.pageYOffset > 0) {
      scrolled = true;
    } else {
      scrolled = false;
    }
  }

  function onKeyPress(event) {
    // enter key
    if (event.charCode === 13) {
      doSearch();
    }
  }

  function doSearch() {
    push(getSearchLink($querystring, search.trim()));
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
      <a href="/" class="navbar-item" use:link>
        <h1 class="title">{websiteTitle}</h1>
      </a>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded={navbarOpen}
        class:is-active={navbarOpen}
        on:click={() => (navbarOpen = !navbarOpen)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>
    <div class="navbar-menu" class:is-active={navbarOpen}>
      <!--<div class="navbar-start">
        <a href="." class="navbar-item"> menu here </a>
      </div>-->
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                class="input is-rounded"
                type="search"
                placeholder="search"
                bind:value={search}
                on:keypress={onKeyPress}
              />
            </div>
            <div class="control">
              <button class="button is-rounded" on:click={doSearch}>
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
