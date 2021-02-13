<script lang="ts">
  import { onMount } from "svelte";
  import { getAllLabels } from "../../api";
  import TagsMenuItem from "./TagsMenuItem.svelte";

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

<article class="panel">
  <p class="panel-heading">Tags</p>
  <div class="panel-block">
    <p class="control has-icons-left">
      <input class="input" type="text" placeholder="Search tags" />
      <span class="icon is-left">
        <i class="fas fa-search" aria-hidden="true" />
      </span>
    </p>
  </div>
  {#if labels}
    {#each labels as label}
      <TagsMenuItem {label} />
    {/each}
  {:else}
    {#each Array(5) as _}
      <TagsMenuItem />
    {/each}
  {/if}
</article>
