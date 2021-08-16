<script lang="ts">
  import { getAllArticles } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";
  import TagTitle from "./TagTitle.svelte";
  import Pagination from "./Pagination.svelte";

  export let tag = "";
  export let currentPage = 1;
  let articles = null;
  let totalPages = 0;

  function fetchData(tag, currentPage) {
    articles = null;

    let tagParam = [];
    if (tag !== "") {
      tagParam = [tag];
    }

    getAllArticles(tagParam, currentPage)
      .then((res) => {
        console.log(res.data);
        articles = res.data.items;
        totalPages = Math.ceil(res.data.total_count / res.data.per_page);
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  $: fetchData(tag, currentPage);
</script>

<TagTitle {tag} />
{#if articles}
  {#each articles as issue}
    <ArticleItem {issue} />
  {/each}
{:else}
  {#each Array(5) as _}
    <ArticleItem />
  {/each}
{/if}
<Pagination {currentPage} {totalPages} />
