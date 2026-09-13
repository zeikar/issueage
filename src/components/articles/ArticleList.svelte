<script lang="ts">
  import { getAllArticles } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";
  import ArticlesHeader from "./ArticlesHeader.svelte";
  import Pagination from "./Pagination.svelte";
  import ArticlesNotFound from "./ArticlesNotFound.svelte";
  import ErrorMessage from "../common/ErrorMessage.svelte";

  export let tag = "";
  export let search = "";
  export let currentPage = 1;
  let articles = null;
  let totalPages = 0;
  let error = null;
  let latestRequest = 0;

  function fetchData(tag, search, currentPage) {
    // navigation can outpace responses, so only the latest request may update the list
    const request = ++latestRequest;
    articles = null;
    error = null;

    let tagParam = [];
    if (tag && tag !== "") {
      tagParam = [tag];
    }

    getAllArticles(tagParam, search, currentPage)
      .then((res) => {
        if (request !== latestRequest) {
          return;
        }
        console.log(res.data);
        articles = res.data.items;
        totalPages = Math.ceil(res.data.total_count / res.data.per_page);
        return;
      })
      .catch((err) => {
        console.error(err);
        if (request === latestRequest) {
          error = err;
        }
      });
  }

  $: fetchData(tag, search, currentPage);
</script>

<ArticlesHeader {tag} {search} />
{#if error}
  <ErrorMessage {error} />
{:else if articles}
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
