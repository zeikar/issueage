<script lang="ts">
  import { link, querystring } from "svelte-spa-router";
  import { getTagLink } from "../../lib/links";

  export let tag;
</script>

<a class="tag" href={getTagLink($querystring, tag)} use:link> {tag} </a>
