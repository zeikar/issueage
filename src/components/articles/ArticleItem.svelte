<script lang="ts">
  import { onMount } from "svelte";
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";
  import { formatDate } from "../../lib/datetime";
  import { getHTMLWithoutTags, getFirstImageUrl } from "../../lib/marked";
  import { convertLabelsToTags } from "../../lib/tags";
  import TagList from "../tags/TagList.svelte";

  export let issue = null;
  let thumbnail;

  onMount(() => {
    if (issue === null) {
      return;
    }

    thumbnail = getFirstImageUrl(issue.body);
  });
</script>

<div class="box">
  <div class="columns">
    <div class="column">
      <div class="content">
        {#if issue}
          <a href={`/articles/${issue.number}`} use:link>
            <h3>{issue.title}</h3>
          </a>
        {:else}
          <h3><SkeletonLoader width={50} /></h3>
        {/if}

        <p>
          {#if issue}
            {@html getHTMLWithoutTags(issue.body).substring(0, 100)}
          {:else}
            <SkeletonLoader />
          {/if}
        </p>

        <p>
          {#if issue}
            <span class="icon">
              <i class="fas fa-clock" />
            </span>{formatDate(issue.created_at)}
            <span class="icon">
              <i class="fas fa-comment" />
            </span>{issue.comments} comments
          {:else}
            <SkeletonLoader width={30} />
          {/if}
        </p>
      </div>
    </div>
    {#if issue}
      {#if thumbnail}
        <div class="column is-narrow">
          <div class="image image-container">
            <img
              class="article-image"
              src={thumbnail}
              alt="article thumbnail"
            />
          </div>
        </div>
      {/if}
    {:else}
      <div class="column is-narrow-desktop">
        <div class="image image-container">
          <SkeletonLoader />
        </div>
      </div>
    {/if}
  </div>

  {#if issue}
    <TagList tags={convertLabelsToTags(issue.labels)} />
  {:else}
    <SkeletonLoader />
  {/if}
</div>

<style>
  div.content {
    word-break: keep-all;
    word-wrap: break-word;
  }
  div.image-container {
    min-width: 128px;
    height: 128px;
  }
  img.article-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
