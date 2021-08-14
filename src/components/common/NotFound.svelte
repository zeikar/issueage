<script lang="ts">
  import { link } from "svelte-spa-router";
</script>

<section class="hero is-large">
  <div class="hero-body has-text-centered">
    <h1 class="title is-1">404</h1>
    <h3 class="subtitle is-3">Not Found</h3>

    <a href="/" use:link>
      <span class="icon-text">
        <span class="icon">
          <i class="fas fa-home" />
        </span>
        <span>Go Home</span>
      </span>
    </a>
  </div>
</section>
