<script lang="ts">
  import { link } from "svelte-spa-router";

  export let tag: string;
</script>

<a class="tag" href={`/tags/${tag}`} use:link> {tag} </a>
