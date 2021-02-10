<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";

  let issueList = null;

  onMount(() => {
    getAllIssues()
      .then((res) => {
        console.log(res.data);
        issueList = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

<section class="section">
  <div class="container">
    {#if issueList}
      {#each issueList as issue}
        <ArticleItem {issue} />
      {/each}
    {:else}
      {#each Array(5) as _}
        <ArticleItem />
      {/each}
    {/if}
  </div>
</section>
