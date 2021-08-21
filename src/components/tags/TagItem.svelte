<script lang="ts">
  import { link, querystring } from "svelte-spa-router";
  import { getTagLink } from "../../lib/links";
  import {
    getTextClassFromBackgroundColor,
    getDimmedColor,
  } from "../../lib/color";

  export let tag;
</script>

<a
  class="tag {getTextClassFromBackgroundColor(tag.color)}"
  style={`background-color: #${getDimmedColor(tag.color)};`}
  href={getTagLink($querystring, tag.name)}
  use:link
>
  {tag.name}
</a>
