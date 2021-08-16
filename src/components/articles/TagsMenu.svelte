<script lang="ts">
  import { onMount } from "svelte";
  import { getTags } from "../../api";
  import TagsMenuItem from "./TagsMenuItem.svelte";
  import SpinnerLoader from "../common/SpinnerLoader.svelte";

  export let tags = [];
  let newTags = [];
  export let selectedTag = null;
  let tagsPage = 1;
  let tagsFetching = true;
  let noMoreTags = false;

  onMount(() => {
    fetchMoreTags();
  });

  function fetchMoreTags() {
    tagsFetching = true;
    tags.push(...newTags);
    tags = tags;
    newTags = [];

    getTags(tagsPage++)
      .then((res) => {
        console.log(res.data);
        newTags = res.data;
        tagsFetching = false;
        noMoreTags = newTags.length === 0;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<article class="panel">
  <p class="panel-heading">Tags</p>

  {#each tags as label}
    <TagsMenuItem {label} selected={selectedTag === label.name} />
  {/each}
  {#if !tagsFetching}
    {#each newTags as label}
      <TagsMenuItem {label} selected={selectedTag === label.name} />
    {/each}
  {/if}
  {#if tagsFetching}
    {#each Array(5) as _}
      <TagsMenuItem />
    {/each}
  {/if}

  {#if !noMoreTags}
    <div class="panel-block">
      <button
        class="button is-outlined is-fullwidth"
        on:click={fetchMoreTags}
        disabled={tagsFetching}
      >
        {#if tagsFetching}
          <SpinnerLoader />
        {:else}
          More tags
        {/if}
      </button>
    </div>
  {/if}
</article>
