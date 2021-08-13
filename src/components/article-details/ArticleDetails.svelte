<script lang="ts">
  import { onMount } from "svelte";
  import { getIssue } from "../../api";
  import { formatDate } from "../../lib/datetime";
  import { getHTML } from "../../lib/marked";
  import { convertLabelsToTags } from "../../lib/tags";
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import TagList from "../tags/TagList.svelte";

  export let params;
  let issue = null;

  onMount(() => {
    getIssue(params.issueNumber)
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
        <TagList tags={convertLabelsToTags(issue.labels)} alignCenter />
      {:else}
        <SkeletonLoader width={80} alignCenter />
      {/if}
    </div>
  </div>
</section>
<section class="section">
  <div class="container">
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
</section>
<section class="section" />

<style>
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
