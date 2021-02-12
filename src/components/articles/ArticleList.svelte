<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";

  let issues = null;

  onMount(() => {
    getAllIssues()
      .then((res) => {
        console.log(res.data);
        issues = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

{#if issues}
  {#each issues as issue}
    <ArticleItem {issue} />
  {/each}
{:else}
  {#each Array(5) as _}
    <ArticleItem />
  {/each}
{/if}
