<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";

  let issueList = [];

  onMount(async () => {
    const res = await getAllIssues();
    issueList = res.repository.issues.nodes;
  });
</script>

<section class="section">
  <div class="container">
    {#each issueList as issue}
      <ArticleItem {issue} />
    {/each}
  </div>
</section>
