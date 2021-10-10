<script lang="ts">
  import { onMount } from "svelte";
  import { getTags } from "../../api";
  import TagList from "../tags/TagList.svelte";

  export let tags = [];
  let tagsPage = 1;
  let tagsFetching = true;
  let noMoreTags = false;

  onMount(() => {
    fetchMoreTags();
  });

  function fetchMoreTags() {
    tagsFetching = true;

    getTags(tagsPage++)
      .then((res) => {
        console.log(res.data);

        const newTags = res.data;
        tags = tags.concat(newTags);
        tagsFetching = false;
        noMoreTags = newTags.length === 0;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<div>
  <p class="title">Tags</p>
  <TagList {tags} />

  {#if !noMoreTags}
    <button
      class="button is-outlined is-link is-small"
      class:is-loading={tagsFetching}
      on:click={fetchMoreTags}
      disabled={tagsFetching}
    >
      More tags
    </button>
  {/if}
</div>
