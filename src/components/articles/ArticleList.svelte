<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import TagList from "../tags/TagList.svelte";
  import ArticleItem from "./ArticleItem.svelte";
  import TagTitle from "./TagTitle.svelte";

  export let tag = "";
  let issues = null;

  function fetchData(tag) {
    issues = null;
    getAllIssues([tag])
      .then((res) => {
        console.log(res.data);
        issues = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  $: fetchData(tag);

  onMount(() => fetchData(tag));
</script>

<TagTitle {tag} />
{#if issues}
  {#each issues as issue}
    <ArticleItem {issue} />
  {/each}
{:else}
  {#each Array(5) as _}
    <ArticleItem />
  {/each}
{/if}
