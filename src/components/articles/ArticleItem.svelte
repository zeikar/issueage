<script lang="ts">
  import { push } from "svelte-spa-router";
  export let issue;

  function onClickArticle() {
    push(`/articles/${issue.number}`);
  }
</script>

<style>
  .article-wrapper {
    cursor: pointer;
  }
</style>

<div class="article-wrapper columns is-desktop" on:click={onClickArticle}>
  <div class="column has-text-centered">
    <img
      class="article-image"
      src="https://lunawood.com/wp-content/uploads/2018/02/placeholder-image.png"
      alt="article thumbnail" />
  </div>
  <div class="column is-four-fifths">
    <nav class="level">
      <div class="content">
        <h2>{issue.title}</h2>
        <p class="article-content">{issue.body}</p>
        <p>
          <span class="icon">
            <i class="fas fa-clock" />
          </span>{issue.created_at}
        </p>
      </div>
    </nav>
  </div>
</div>
