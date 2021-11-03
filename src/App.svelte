<script lang="ts">
  import { GoogleAnalytics } from "@beyonk/svelte-google-analytics";

  import Router from "svelte-spa-router";
  import routes from "./routes";

  import Navbar from "./components/common/Navbar.svelte";
  import Footer from "./components/common/Footer.svelte";

  // global config (config.json)
  export let Config;
</script>

<GoogleAnalytics properties={[Config.googleAnalyticsId]} />
<Navbar websiteTitle={Config.websiteTitle} />
<Router {routes} restoreScrollState={true} />
<Footer websiteTitle={Config.websiteTitle} />
