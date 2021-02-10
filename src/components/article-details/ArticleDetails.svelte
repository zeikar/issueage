<script lang="ts">
  import { onMount } from "svelte";
  import { getIssue } from "../../api";
  import { getHTML } from "../../lib/marked";

  export let params;
  let issue = null;

  onMount(() => {
    getIssue(params.issueNumber)
      .then((res) => {
        console.log(res.data);
        issue = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

{#if issue}
  <section class="hero has-text-centered">
    <div class="hero-body">
      <h1 class="title">{issue.title}</h1>
      <p class="subtitle">{issue.updated_at}</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="content">{@html getHTML(issue.body)}</div>
    </div>
  </section>
  <section class="section" />
{/if}

<style>
  /*.post img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 4rem;
    margin-bottom: 4rem;
    max-width: 50%;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    color: #4a4a4a;
  }*/
</style>
