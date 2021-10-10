<script lang="ts">
  export let width = 100;
  export let alignCenter = false;
  export let rounded = false;
</script>

<div
  class:is-centered={alignCenter}
  class:is-rounded={rounded}
  class="placeholder-item"
  style="width: {width}%"
/>

<style>
  .placeholder-item {
    width: 100%;
    height: 100%;
    min-height: 20px;
    background: #e8e8e8;
    position: relative;
    overflow: hidden;
  }

  .placeholder-item::before {
    content: "";
    display: block;
    position: absolute;
    left: -150px;
    top: 0;
    height: 100%;
    width: 150px;
    background: linear-gradient(
      to right,
      transparent 0%,
      #ffffff 50%,
      transparent 100%
    );
    animation: load 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes load {
    from {
      left: -150px;
    }
    to {
      left: 100%;
    }
  }

  .is-rounded {
    border-radius: 290486px;
  }
</style>
