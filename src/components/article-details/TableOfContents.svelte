<script lang="ts">
  import { onMount } from "svelte";
  import TableOfContentsList from "./TableOfContentsList.svelte";

  export let toc = null;

  // codes are based on https://www.cssscript.com/animated-side-toc-nav-long-web-content/
  let tocContainer, tocPath, tocItems, pathLength;

  // Factor of screen size that the element must cross
  // before it's considered visible
  const TOP_MARGIN = 0.1,
    BOTTOM_MARGIN = 0.2;

  onMount(() => {
    if (!toc) {
      return;
    }

    tocContainer = document.querySelector(".toc");
    tocPath = document.querySelector(".toc-marker path");

    window.addEventListener("resize", drawPath, false);
    window.addEventListener("scroll", sync, false);

    drawPath();
  });

  function drawPath() {
    tocItems = [].slice.call(tocContainer.querySelectorAll("li"));

    // Cache element references and measurements
    tocItems = tocItems.map(function (item) {
      const anchor = item.querySelector("span");
      const target = document.getElementById(anchor.getAttribute("link"));

      return {
        listItem: item,
        anchor: anchor,
        target: target,
      };
    });

    // Remove missing targets
    tocItems = tocItems.filter(function (item) {
      return !!item.target;
    });

    const path = [];
    let pathIndent;

    tocItems.forEach(function (item, i) {
      const x = item.anchor.offsetLeft - 1;
      const y = item.anchor.offsetTop;
      const height = item.anchor.offsetHeight;

      if (i === 0) {
        path.push("M", x, y, "L", x, y + height);
        item.pathStart = 0;
      } else {
        // Draw an additional line when there's a change in
        // indent levels
        if (pathIndent !== x) path.push("L", pathIndent, y);

        path.push("L", x, y);

        // Set the current path so that we can measure it
        tocPath.setAttribute("d", path.join(" "));
        item.pathStart = tocPath.getTotalLength() || 0;

        path.push("L", x, y + height);
      }

      pathIndent = x;

      tocPath.setAttribute("d", path.join(" "));
      item.pathEnd = tocPath.getTotalLength();
    });

    pathLength = tocPath.getTotalLength();

    sync();
  }

  function sync() {
    const windowHeight = window.innerHeight;

    let pathStart = Number.MAX_VALUE,
      pathEnd = 0;

    let visibleItems = 0;

    for (let i = 0; i < tocItems.length; i++) {
      const item = tocItems[i];
      const nextItem = tocItems[i + 1];

      const currentTargetTop = item.target.getBoundingClientRect().top;
      let nextTargetTop;
      if (i < tocItems.length - 1) {
        nextTargetTop = nextItem.target.getBoundingClientRect().top;
      } else {
        nextTargetTop = currentTargetTop + windowHeight;
      }

      if (
        nextTargetTop > windowHeight * TOP_MARGIN &&
        currentTargetTop < windowHeight * (1 - BOTTOM_MARGIN)
      ) {
        pathStart = Math.min(item.pathStart, pathStart);
        pathEnd = Math.max(item.pathEnd, pathEnd);

        visibleItems += 1;

        item.listItem.classList.add("visible");
      } else {
        item.listItem.classList.remove("visible");
      }
    }

    // Specify the visible path or hide the path altogether
    // if there are no visible items
    if (visibleItems > 0 && pathStart < pathEnd) {
      tocPath.setAttribute("stroke-dashoffset", "1");
      tocPath.setAttribute(
        "stroke-dasharray",
        "1, " + pathStart + ", " + (pathEnd - pathStart) + ", " + pathLength
      );
      tocPath.setAttribute("opacity", 1);
    } else {
      tocPath.setAttribute("opacity", 0);
    }
  }
</script>

{#if toc}
  <div class="toc-container">
    <aside class="menu toc">
      <p class="menu-label">On this page</p>

      <TableOfContentsList items={toc} />

      <svg
        class="toc-marker"
        width="200"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke="#444"
          stroke-width="3"
          fill="transparent"
          stroke-dasharray="0, 0, 0, 1000"
          stroke-linecap="round"
          stroke-linejoin="round"
          transform="translate(-0.5, -0.5)"
        />
      </svg>
    </aside>
  </div>
{/if}

<style>
  div.toc-container {
    position: relative;
    padding-left: 0.3em;
  }

  :global(.toc ul) {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  :global(.toc ul ul) {
    padding-left: 0.5em;
  }

  :global(.toc li span) {
    cursor: pointer;
    display: inline-block;
    color: #aaa;
    text-decoration: none;
    -webkit-transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }

  :global(.toc li.visible span) {
    color: #111;
    -webkit-transform: translate(5px);
    transform: translate(5px);
  }

  .toc-marker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .toc-marker path {
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }

  :global(.anchor) {
    visibility: hidden;
  }

  :global(.heading:hover .anchor) {
    visibility: visible;
  }
</style>
