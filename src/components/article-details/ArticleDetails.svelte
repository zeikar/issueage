<script lang="ts">
  import { onMount } from "svelte";
  import { getIssue } from "../../api";
  import { formatDate } from "../../lib/datetime";
  import { getHTML, getTableOfContents } from "../../lib/marked";
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import TagList from "../tags/TagList.svelte";
  import Comments from "./Comments.svelte";
  import TableOfContents from "./TableOfContents.svelte";

  export let params;
  let issue = null;

  onMount(() => {
    getIssue(params.articleNumber)
      .then((res) => {
        console.log(res.data);
        issue = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

<svelte:head>
  {#if issue}
    <title>{issue.title}</title>
  {/if}
</svelte:head>
<section class="hero has-text-centered">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">
        {#if issue}
          {issue.title}
        {:else}
          <SkeletonLoader width={50} alignCenter />
        {/if}
      </h1>
      <p class="subtitle">
        {#if issue}
          {formatDate(issue.created_at)}
        {:else}
          <SkeletonLoader width={30} alignCenter />
        {/if}
      </p>
      {#if issue}
        <TagList tags={issue.labels} alignCenter />
      {:else}
        <SkeletonLoader width={80} alignCenter />
      {/if}
    </div>
  </div>
</section>
<section class="section">
  <div class="container is-max-widescreen">
    <div class="columns is-desktop">
      <div class="column is-2-desktop">
        <div class="sticky">
          {#if issue}
            <TableOfContents toc={getTableOfContents(issue.body)} />
          {/if}
        </div>
      </div>
      <div class="column is-10-desktop">
        <div class="content">
          {#if issue}
            {@html getHTML(issue.body)}
          {:else}
            {#each Array(10) as _}
              <p>
                <SkeletonLoader />
              </p>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section">
  {#if issue}
    <Comments issueNumber={issue.number} />
  {/if}
</section>

<style>
  @media screen and (min-width: 769px) {
    div.sticky {
      position: sticky;
      top: 4rem;
      bottom: 0;
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  div.sticky::-webkit-scrollbar {
    width: 8px; /* width of the entire scrollbar */
  }
  div.sticky::-webkit-scrollbar-thumb {
    background-color: lightgray; /* color of the scroll thumb */
    border-radius: 10px; /* roundness of the scroll thumb */
  }
  div.content {
    margin-left: auto;
    margin-right: auto;
    word-break: keep-all;
    word-wrap: break-word;
  }
  /*.post img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 4rem;
    margin-bottom: 4rem;
    max-width: 50%;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    color: #4a4a4a;
  }*/
</style>
