<script lang="ts">
  export let tag = null;
  export let search = null;
</script>

<div class="field is-grouped is-grouped-multiline">
  {#if tag}
    <div class="control">
      <div class="tags are-medium has-addons">
        <span class="tag is-dark">
          <span class="icon">
            <i class="fas fa-hashtag" />
          </span>
        </span>
        <span class="tag is-info">{tag}</span>
        <span class="tag is-delete" />
      </div>
    </div>
  {/if}

  {#if search}
    <div class="control">
      <div class="tags are-medium has-addons">
        <span class="tag is-dark">
          <span class="icon">
            <i class="fas fa-search" />
          </span>
        </span>
        <span class="tag is-primary">{search}</span>
        <span class="tag is-delete" />
      </div>
    </div>
  {/if}
</div>
