<script lang="ts">
  import { onMount } from "svelte";
  import { querystring, push } from "svelte-spa-router";
  import { getSearchLink } from "../../lib/links";

  export let websiteTitle;
  let scrolled = false;
  let search = "";

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
    push(getSearchLink($querystring, search));
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
      <!--<div class="navbar-start">
        <a href="." class="navbar-item"> menu here </a>
      </div>-->
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field has-addons">
            <div class="control">
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
