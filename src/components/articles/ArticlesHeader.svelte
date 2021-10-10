<script lang="ts">
  import { push, querystring } from "svelte-spa-router";
  import { deleteTagFromLink, deleteSearchFromLink } from "../../lib/links";

  export let tag = null;
  export let search = null;

  function deleteTag() {
    push(deleteTagFromLink($querystring));
  }
  function deleteSearch() {
    push(deleteSearchFromLink($querystring));
  }
</script>

<div class="field is-grouped is-grouped-multiline">
  {#if tag}
    <div class="control">
      <div class="tags are-medium has-addons">
        <span class="tag is-dark">
          <span class="icon">
            <i class="fas fa-hashtag" />
          </span>
        </span>
        <span class="tag is-primary">{tag}</span>
        <span class="tag is-delete" on:click={deleteTag} />
      </div>
    </div>
  {/if}

  {#if search}
    <div class="control">
      <div class="tags are-medium has-addons">
        <span class="tag is-dark">
          <span class="icon">
            <i class="fas fa-search" />
          </span>
        </span>
        <span class="tag is-primary">{search}</span>
        <span class="tag is-delete" on:click={deleteSearch} />
      </div>
    </div>
  {/if}
</div>
