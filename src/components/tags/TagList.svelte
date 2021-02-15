<script lang="ts">
  import TagItem from "./TagItem.svelte";

  export let alignCenter = false;
  export let tags = [];
</script>

<div class="tags" class:is-centered={alignCenter}>
  {#each tags as tag}
    <TagItem {tag} />
  {/each}
</div>
