<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import { link } from "svelte-spa-router";
  import { getHTMLWithoutTags } from "../../lib/marked";

  export let issue = null;
</script>

<div class="columns is-desktop">
  <div class="column is-four-fifths">
    <div class="content">
      {#if issue}
        <a href={`/articles/${issue.number}`} use:link>
          <h2>{issue.title}</h2>
        </a>
      {:else}
        <h2><SkeletonLoader width={50} /></h2>
      {/if}

      <p class="article-content">
        {#if issue}
          {@html getHTMLWithoutTags(issue.body.substring(0, 100))}
        {:else}
          <SkeletonLoader />
        {/if}
      </p>

      <p>
        {#if issue}
          <span class="icon">
            <i class="fas fa-clock" />
          </span>{issue.created_at}
        {:else}
          <SkeletonLoader width={30} />
        {/if}
      </p>
    </div>
  </div>
  <div class="column has-text-centered">
    <figure class="image is-128x128">
      {#if issue}
        <img
          class="article-image"
          src="https://bulma.io/images/placeholders/128x128.png"
          alt="article thumbnail"
        />
      {:else}
        <SkeletonLoader />
      {/if}
    </figure>
  </div>
</div>
