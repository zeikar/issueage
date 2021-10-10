<script lang="ts">
  import { onMount } from "svelte";
  import Config from "../../../config.json";

  export let issueNumber = null;
  let commentsContainer;

  onMount(() => {
    // create script element
    const utterances = document.createElement("script");
    utterances.type = "text/javascript";
    utterances.async = true;
    utterances.crossOrigin = "anonymous";
    utterances.src = "https://utteranc.es/client.js";

    utterances.setAttribute("issue-number", issueNumber);
    utterances.setAttribute("theme", "github-light");
    utterances.setAttribute("repo", `${Config.repoOwner}/${Config.repoName}`);

    commentsContainer.appendChild(utterances);
  });
</script>

<div class="container is-max-desktop" bind:this={commentsContainer} />

<style>
  :global(.utterances) {
    max-width: 100%;
  }
</style>
