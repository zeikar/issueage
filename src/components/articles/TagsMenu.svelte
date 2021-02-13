<script lang="ts">
  import { onMount } from "svelte";
  import { getAllLabels } from "../../api";
  import TagMenuItem from "./TagMenuItem.svelte";

  export let labels = null;

  onMount(() => {
    getAllLabels()
      .then((res) => {
        console.log(res.data);
        labels = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

<aside class="menu">
  <p class="menu-label">Tags</p>
  <ul class="menu-list">
    {#if labels}
      {#each labels as label}
        <TagMenuItem {label} />
      {/each}
    {:else}
      {#each Array(5) as _}
        <TagMenuItem />
      {/each}
    {/if}
  </ul>
</aside>
