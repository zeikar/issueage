<script lang="ts">
  import { onMount } from "svelte";
  import { getGithubProfile } from "../../api";
  import ProfileItem from "./ProfileItem.svelte";

  let profile = null;
  let error = null;

  onMount(() => {
    getGithubProfile()
      .then((res) => {
        console.log(res.data);
        profile = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
        error = err;
      });
  });
</script>

{#if !error}
  <ProfileItem {profile} />
{/if}
