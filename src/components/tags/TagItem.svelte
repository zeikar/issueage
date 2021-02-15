<script lang="ts">
  import { link } from "svelte-spa-router";
  import { getTagLink } from "../../lib/tags";

  export let tag: string;
</script>

<a class="tag" href={getTagLink(tag)} use:link> {tag} </a>
