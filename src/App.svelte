<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "./routes";

  import Navbar from "./components/common/Navbar.svelte";
  import Footer from "./components/common/Footer.svelte";

  // global config (config.json)
  export let Config;
</script>

<Navbar websiteTitle={Config.websiteTitle} />
<Router {routes} />
<Footer websiteTitle={Config.websiteTitle} />
