<script lang="ts">
  import { onMount } from "svelte";
  import { getGithubProfile } from "../../api";
  import ProfileItem from "./ProfileItem.svelte";

  let profile = null;

  onMount(() => {
    getGithubProfile()
      .then((res) => {
        console.log(res.data);
        profile = res.data;
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });
</script>

<ProfileItem {profile} />
