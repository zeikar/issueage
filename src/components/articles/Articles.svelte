<script lang="ts">
  import ArticleList from "./ArticleList.svelte";
  import Profile from "./Profile.svelte";
  import TagsMenu from "./TagsMenu.svelte";
</script>

<section class="hero is-medium has-text-centered">
  <div class="hero-body">
    <Profile />
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column is-one-fifth">
        <TagsMenu />
      </div>

      <div class="column">
        <ArticleList />
      </div>
    </div>
  </div>
</section>
