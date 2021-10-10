<script>
  export let items = [];

  function scrollToAnchor(anchor) {
    // scroll to anchor
    const scrollElement = document.getElementById(anchor);
    if (scrollElement) {
      // navbar offset + shadow
      const offset =
        3.25 * parseFloat(getComputedStyle(document.documentElement).fontSize) +
        2;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = scrollElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
</script>

<ul class="menu_list">
  {#each items as item}
    <li>
      {#if item.text}
        <span link={item.anchor} on:click={scrollToAnchor(item.anchor)}>
          {item.text}
        </span>
      {/if}
      {#if item.children}
        <svelte:self items={item.children} let:item />
      {/if}
    </li>
  {/each}
</ul>
