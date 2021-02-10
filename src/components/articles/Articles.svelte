<script lang="ts">
  import { onMount } from "svelte";
  import { getAllIssues } from "../../api";
  import ArticleItem from "./ArticleItem.svelte";
  import TagsMenu from "./TagsMenu.svelte";

  let issueList = null;

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

<section class="hero is-medium has-text-centered">
  <div class="hero-body">
    <p class="title">Profile name</p>
    <p class="subtitle">Profile description</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column is-one-fifth">
        <TagsMenu />
      </div>

      <div class="column">
        {#if issueList}
          {#each issueList as issue}
            <ArticleItem {issue} />
          {/each}
        {:else}
          {#each Array(5) as _}
            <ArticleItem />
          {/each}
        {/if}
      </div>
    </div>
  </div>
</section>
