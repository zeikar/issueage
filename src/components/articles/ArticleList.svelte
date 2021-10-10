<script lang="ts">
  import { getAllArticles } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";
  import ArticlesHeader from "./ArticlesHeader.svelte";
  import Pagination from "./Pagination.svelte";
  import ArticlesNotFound from "./ArticlesNotFound.svelte";

  export let tag = "";
  export let search = "";
  export let currentPage = 1;
  let articles = null;
  let totalPages = 0;

  function fetchData(tag, search, currentPage) {
    articles = null;

    let tagParam = [];
    if (tag && tag !== "") {
      tagParam = [tag];
    }

    getAllArticles(tagParam, search, currentPage)
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

  $: fetchData(tag, search, currentPage);
</script>

<ArticlesHeader {tag} {search} />
{#if articles}
  {#if articles.length === 0}
    <ArticlesNotFound />
  {:else}
    {#each articles as issue}
      <ArticleItem {issue} />
    {/each}
  {/if}
{:else}
  {#each Array(10) as _}
    <ArticleItem />
  {/each}
{/if}
<Pagination {currentPage} {totalPages} />
