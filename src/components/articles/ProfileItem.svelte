<script lang="ts">
  import SkeletonLoader from "../common/SkeletonLoader.svelte";
  import Config from "../../../config.json";

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

<div class="breadcrumb has-bullet-separator is-centered">
  {#if profile}
    <ul>
      <li>
        <a
          href={`https://github.com/${Config.repoOwner}?tab=followers`}
          target="_blank"
        >
          <span class="icon">
            <i class="fas fa-users" />
          </span>
          <span>{profile.followers} followers</span>
        </a>
      </li>
      <li>
        <a
          href={`https://github.com/${Config.repoOwner}?tab=following`}
          target="_blank"
        >
          <span class="icon">
            <i class="fas fa-user" />
          </span>
          <span>{profile.following} following</span>
        </a>
      </li>
    </ul>
  {:else}
    <SkeletonLoader width={40} alignCenter />
  {/if}
</div>
