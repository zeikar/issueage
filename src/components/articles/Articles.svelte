<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";

  let issueList = [];

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
    {#each issueList as issue}
      <ArticleItem {issue} />
    {/each}
  </div>
</section>
