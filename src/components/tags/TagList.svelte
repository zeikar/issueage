<script lang="ts">
  import TagItem from "./TagItem.svelte";

  export let alignCenter: boolean = false;
  export let tags: string[] = [];
</script>

<div class="tags" class:is-centered={alignCenter}>
  {#each tags as tag}
    <TagItem {tag} />
  {/each}
</div>
