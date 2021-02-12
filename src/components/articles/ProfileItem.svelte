<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";

  export let profile = null;
</script>

<div class="has-text-centered">
  <figure class="image is-128x128 is-inline-block">
    {#if profile}
      <img class="is-rounded" src={profile.avatar_url} alt="profile" />
    {:else}
      <SkeletonLoader rounded />
    {/if}
  </figure>
</div>

<p class="title">
  {#if profile}
    {profile.name}
  {:else}
    <SkeletonLoader width={30} alignCenter />
  {/if}
</p>

<p class="subtitle">
  {#if profile}
    {profile.bio}
  {:else}
    <SkeletonLoader width={50} alignCenter />
  {/if}
</p>
