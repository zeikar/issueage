<script lang="ts">
  import { link, querystring } from "svelte-spa-router";
  import { generatePaginationLink } from "../../lib/links";

  export let currentPage;
  export let totalPages;

  function getPaginationPages(totalPages) {
    const pages = [1];

    // current page +- 2
    for (let p = 0; p <= 4; p++) {
      pages.push(currentPage + p - 2);
    }

    pages.push(totalPages);

    console.log([...new Set(pages.filter((p) => p >= 1 && p <= totalPages))]);

    // filter out of range pages, get distinct pages
    return [...new Set(pages.filter((p) => p >= 1 && p <= totalPages))];
  }
</script>

{#if totalPages !== 0}
  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
    <span class="pagination-previous">Previous</span>
    <span class="pagination-next">Next page</span>
    <ul class="pagination-list">
      {#each getPaginationPages(totalPages) as page (page)}
        <li>
          <a
            class="pagination-link"
            aria-label="Goto page {page}"
            class:is-current={page === currentPage}
            href={generatePaginationLink($querystring, page)}
            use:link
          >
            {page}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
