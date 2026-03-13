<script>
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import Icon from '@iconify/svelte';
  import { formatMonthDay } from '@/utils/time';
  import { getRelativeUrl } from '@utils/url-utils';
  import { getArchiveSubtitle, uiText } from '@constants/ui-text';

  export let sortedPosts = [];

  let selectedCategories = [];

  $: categories = [...new Set(sortedPosts.map(post => post.data.category || 'undefined'))].sort();

  $: filteredPosts = selectedCategories.length > 0
    ? sortedPosts.filter(post => {
        const postCat = post.data.category || 'undefined';
        return selectedCategories.includes(postCat);
      })
    : sortedPosts;

  $: postsByYear = filteredPosts.reduce((acc, post) => {
    const year = new Date(post.data.pubDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  $: years = Object.keys(postsByYear).sort((a, b) => b - a);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');

    if (categoryParam === 'undefined') {
      selectedCategories = ['undefined'];
    } else if (categoryParam && categoryParam !== 'null') {
      selectedCategories = categoryParam.split(',');
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      selectedCategories = params.get('category')?.split(',') || [];
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

  function toggleCategory(cat) {
    if (cat === null) {
      selectedCategories = [];
    } else if (selectedCategories.includes(cat)) {
      selectedCategories = selectedCategories.filter(c => c !== cat);
    } else {
      selectedCategories = [...selectedCategories, cat];
    }

    const url = new URL(window.location);
    if (selectedCategories.length > 0) {
      url.searchParams.set('category', selectedCategories.join(','));
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url);
  }
</script>

<div class="archives mx-auto w-full max-w-[var(--page-width)]">
  <div class="text-center pt-5 pb-10 max-w-[var(--page-width)] mx-auto md:mt-0 mt-28">
    <p class="text-[var(--text-color)] text-3xl py-5 font-bold">{uiText.header.archive}</p>
    <p class="text-[var(--text-color-70)] font-bold">{getArchiveSubtitle(filteredPosts.length)}</p>
  </div>

  <div class="py-6 mx-auto text-[var(--text-color)]">
    {#each years as year (year)}
      <div class="mb-8">
        <h2 class="text-2xl font-bold my-4 text-[var(--text-color)] flex items-center gap-3">
          <span class="w-1 h-6 bg-[var(--link-color)] rounded-full"></span>
          {year}
        </h2>
        <div class="space-y-2">
          {#each postsByYear[year] as post (post.id)}
            <div animate:flip={{ duration: 600 }} in:fade={{ duration: 150 }} out:fade={{ duration: 150 }}>
              <a
                href={getRelativeUrl(`/blog/${post.id}`)}
                class="flex items-center gap-4 active:bg-[var(--button-hover-color)] hover:bg-[var(--button-hover-color)] p-2 rounded transition-all duration-200 group"
              >
                <span class="text-[var(--text-color-70)] min-w-[80px] md:min-w-[120px]">
                  {formatMonthDay(post.data.pubDate)}
                </span>

                <span class="text-lg group-hover:pl-2 group-hover:text-[var(--link-color)] group-hover:font-bold transition-all duration-200 flex-1 group-active:text-[var(--link-color)]">
                  {post.data.title}
                </span>

                <span class="hidden md:flex items-center font-mono text-sm text-[var(--text-color-70)]">
                  <Icon icon="fa6-solid:hashtag" class="mr-1" />
                  {post.data.category || uiText.pageCard.uncategorized}
                </span>
              </a>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<aside class="hidden lg:block absolute left-[var(--toc-offset-left)] top-70 bottom-0 w-[var(--category-width)]">
  <div class="sticky top-24">
    <div class="flex items-center gap-2 text-[var(--text-color)] font-bold mb-4 border-b border-[var(--button-border-color)] pb-2 uppercase tracking-wider">
      <Icon icon="fa6-solid:hashtag" class="text-xs" />
      <span>{uiText.category}</span>
    </div>

    <div class="flex flex-wrap gap-2">
      {#each categories as cat}
        <button
          on:click={() => toggleCategory(cat)}
          class="px-3 py-1 text-xs rounded-md transition-all border
          {selectedCategories.includes(cat)
            ? 'bg-[var(--link-color)] text-white border-[var(--link-color)]'
            : 'hover:border-[var(--link-color)] border-[var(--button-border-color)] text-[var(--text-color)]'}"
        >
          {cat === 'undefined' ? uiText.pageCard.uncategorized : cat}
        </button>
      {/each}
    </div>
  </div>
</aside>
