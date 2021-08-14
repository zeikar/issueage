<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";
  import { getTagLink } from "../../lib/tags";

  export let label = null;
  export let selected = false;
</script>

{#if label}
  <a
    class="panel-block tag-item"
    class:is-active={selected}
    href={getTagLink(label.name)}
    use:link
  >
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
  a.tag-item {
    word-break: break-all;
    word-wrap: break-word;
  }
  p {
    padding: 0.5em 0.75em;
  }
</style>
