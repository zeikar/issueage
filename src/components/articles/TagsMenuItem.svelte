<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";

  export let label = null;
</script>

{#if label}
  <a class="panel-block" href={`/tags/${label.name}`} use:link>
    <span class="panel-icon">
      <i class="fas fa-tag" aria-hidden="true" />
    </span>
    {label.name}
  </a>
{:else}
  <p>
    <SkeletonLoader />
  </p>
{/if}

<style>
  p {
    padding: 0.5em 0.75em;
  }
</style>
