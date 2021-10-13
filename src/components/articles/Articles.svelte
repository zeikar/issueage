<script lang="ts">
  import ArticleList from "./ArticleList.svelte";
  import Profile from "./Profile.svelte";
  import TagsMenu from "./TagsMenu.svelte";
  import { querystring } from "svelte-spa-router";
  import { parseQueryString } from "../../lib/querystring";
  import Config from "../../../config.json";

  let tag;
  let page;
  let search;

  $: parse($querystring);

  function parse(qs) {
    const queryData = parseQueryString(qs);
    tag = queryData.tag;
    page = Number(queryData.page || 1);
    search = queryData.search;
  }
</script>

<svelte:head>
  <title>{Config.websiteTitle}</title>
</svelte:head>
<section class="hero has-text-centered">
  <div class="hero-body">
    <Profile />
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column">
        <ArticleList {tag} {search} currentPage={page} />
      </div>
      <div class="column is-one-quarter">
        <TagsMenu />
      </div>
    </div>
  </div>
</section>
