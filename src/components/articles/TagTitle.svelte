<script lang="ts">
  export let tag = null;
</script>

{#if tag}
  <h1 class="title"># {tag}</h1>
{/if}
