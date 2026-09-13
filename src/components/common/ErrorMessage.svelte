<script lang="ts">
  export let error;

  // unauthenticated GitHub API limits are low (search: 10 requests/minute), so this is the common failure
  $: rateLimited = error && (error.status === 403 || error.status === 429);
</script>

<article class="message is-danger">
  <div class="message-body">
    <p>{rateLimited ? "GitHub API rate limit exceeded" : "Failed to load"}</p>
    <p class="is-size-7">Please try again later.</p>
  </div>
</article>
