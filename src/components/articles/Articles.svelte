<script lang="ts">
  import ArticleList from "./ArticleList.svelte";
  import Profile from "./Profile.svelte";
  import TagsMenu from "./TagsMenu.svelte";
  import { querystring } from "svelte-spa-router";
  import { parseQueryString } from "../../lib/querystring";

  let tag;
  let page;

  $: parse($querystring);

  function parse(qs) {
    const queryData = parseQueryString(qs);
    tag = queryData.tag;
    page = Number(queryData.page || 1);
  }
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
        <TagsMenu selectedTag={tag} />
      </div>

      <div class="column">
        <ArticleList {tag} currentPage={page} />
      </div>
    </div>
  </div>
</section>
