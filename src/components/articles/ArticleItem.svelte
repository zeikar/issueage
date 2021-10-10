<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";
  import { formatDate } from "../../lib/datetime";
  import { getHTMLWithoutTags, getFirstImageUrl } from "../../lib/marked";
  import TagList from "../tags/TagList.svelte";

  export let issue = null;
</script>

<div class="box">
  <div class="columns">
    <div class="column">
      <div class="article-content">
        <div class="content">
          {#if issue}
            <a
              class="hover-underline-animation"
              href={`/articles/${issue.number}`}
              use:link
            >
              <div>
                <h1 class="title is-4 is-spaced">
                  <span>{issue.title}</span>
                </h1>
                <p class="subtitle is-6">
                  {@html getHTMLWithoutTags(issue.body, 200)}
                </p>
              </div>
            </a>
          {:else}
            <p class="title is-4 is-spaced"><SkeletonLoader width={50} /></p>
            <p class="subtitle is-6"><SkeletonLoader /></p>
          {/if}
        </div>

        <div class="content">
          {#if issue}
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-clock" />
              </span>
              <span>
                {formatDate(issue.created_at)}
              </span>

              <span class="icon">
                <i class="fas fa-comment" />
              </span>
              <span>
                {issue.comments} comments
              </span>
            </span>
          {:else}
            <SkeletonLoader width={30} />
          {/if}
        </div>
      </div>
    </div>
    {#if issue}
      {#if getFirstImageUrl(issue.body)}
        <div class="column is-narrow">
          <div class="image image-container">
            <img
              class="article-image"
              src={getFirstImageUrl(issue.body)}
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
    <TagList tags={issue.labels} />
  {:else}
    <SkeletonLoader />
  {/if}
</div>

<style>
  div.article-content {
    word-break: keep-all;
    word-wrap: break-word;
  }
  div.image-container {
    min-width: 128px;
    height: 128px;
  }
  @media screen and (min-width: 769px) {
    div.image-container {
      width: 128px;
      height: 128px;
    }
  }
  img.article-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
