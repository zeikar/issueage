<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { push } from "svelte-spa-router";
  import { getHTMLWithoutTags } from "../../lib/marked";

  export let issue = null;

  function onClickArticle() {
    push(`/articles/${issue.number}`);
  }
</script>

<div class="article-wrapper columns is-desktop" on:click={onClickArticle}>
  <div class="column is-four-fifths">
    <div class="content">
      <h2>
        {#if issue}
          {issue.title}
        {:else}
          <SkeletonLoader width={50} />
        {/if}
      </h2>

      <p class="article-content">
        {#if issue}
          {@html getHTMLWithoutTags(issue.body.substring(0, 100))}
        {:else}
          <SkeletonLoader />
        {/if}
      </p>

      <p>
        {#if issue}
          <span class="icon">
            <i class="fas fa-clock" />
          </span>{issue.created_at}
        {:else}
          <SkeletonLoader width={30} />
        {/if}
      </p>
    </div>
  </div>
  <div class="column has-text-centered">
    <figure class="image is-128x128">
      {#if issue}
        <img
          class="article-image"
          src="https://bulma.io/images/placeholders/128x128.png"
          alt="article thumbnail"
        />
      {:else}
        <SkeletonLoader />
      {/if}
    </figure>
  </div>
</div>

<style>
  .article-wrapper {
    cursor: pointer;
  }
</style>
