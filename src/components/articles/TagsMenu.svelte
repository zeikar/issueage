<script lang="ts">
  import { onMount } from "svelte";
  import { getTags } from "../../api";
  import TagList from "../tags/TagList.svelte";

  export let tags = [];
  let tagsPage = 1;
  let tagsFetching = true;
  let noMoreTags = false;
  let tagsError = false;

  onMount(() => {
    fetchMoreTags();
  });

  function fetchMoreTags() {
    tagsFetching = true;
    tagsError = false;

    getTags(tagsPage)
      .then((res) => {
        console.log(res.data);

        const newTags = res.data;
        tags = tags.concat(newTags);
        // advance only on success so a failed page can be retried
        tagsPage++;
        tagsFetching = false;
        noMoreTags = newTags.length === 0;
        return;
      })
      .catch((err) => {
        console.error(err);
        tagsFetching = false;
        tagsError = true;
      });
  }
</script>

<div>
  <p class="title">Tags</p>
  <TagList {tags} />
  {#if tagsError}
    <p class="help is-danger">Failed to load tags.</p>
  {/if}

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
