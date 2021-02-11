<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";

  export let label = null;
</script>

<li>
  {#if label}
    <a href={`/tags/${label.name}`} use:link>{label.name}</a>
  {:else}
    <p>
      <SkeletonLoader />
    </p>
  {/if}
</li>

<style>
  p {
    padding: 0.5em 0.75em;
  }
</style>
