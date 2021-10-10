<script lang="ts">
  import { link, querystring } from "svelte-spa-router";
  import { getPaginationLink } from "../../lib/links";

  export let currentPage;
  export let totalPages;

  function getPaginationPages(totalPages) {
    let pages = [1];

    // current page +- 2
    for (let p = 0; p <= 4; p++) {
      pages.push(currentPage + p - 2);
    }

    pages.push(totalPages);

    // filter out of range pages, get distinct pages
    pages = [...new Set(pages.filter((p) => p >= 1 && p <= totalPages))];

    // insert pagination range separators
    const retPages = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) {
        retPages.push(-i);
      }
      retPages.push(pages[i]);
    }

    return retPages;
  }
</script>

{#if totalPages !== 0}
  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
    <ul class="pagination-list">
      {#each getPaginationPages(totalPages) as page (page)}
        {#if page <= 0}
          <li><span class="pagination-ellipsis">&hellip;</span></li>
        {:else}
          <li>
            <a
              class="pagination-link"
              aria-label="Goto page {page}"
              class:is-current={page === currentPage}
              href={getPaginationLink($querystring, page)}
              use:link
            >
              {page}
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </nav>
{/if}
