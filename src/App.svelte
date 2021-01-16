<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "./routes";

  import Navbar from "./components/common/Navbar.svelte";
  import Footer from "./components/common/Footer.svelte";
</script>

<Navbar />
<Router {routes} />
<Footer websiteTitle={'test'} />
