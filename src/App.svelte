<script lang="ts">
  import Navbar from "./components/common/Navbar.svelte";
  import Articles from "./components/articles/Articles.svelte";
  import ArticleDetails from "./components/article-details/ArticleDetails.svelte";
  import Footer from "./components/common/Footer.svelte";
</script>

<Navbar />
<Articles />
<ArticleDetails issueNumber={2} />
<Footer websiteTitle={"test"} />