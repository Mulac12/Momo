<script lang="ts">
  import { onMount } from 'svelte';
  import { siteConfig } from '@/config.ts';
  import CommentItem from './CommentItem.svelte';
  import { uiText } from '@constants/ui-text';

  export let postSlug: string;
  export let postTitle: string;

  const apiUrl = siteConfig.comments.backendUrl;

  let comments: any[] = [];
  let loading = true;
  let error = '';
  let page = 1;
  let limit = 20;
  let hasMore = false;

  let author = '';
  let email = '';
  let url = '';
  let content = '';
  let submitting = false;
  let replyingToId: number | null = null;

  const STORAGE_KEY = 'comment_user_info';

  function loadUserInfoFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userInfo = JSON.parse(stored);
        author = userInfo.author || '';
        email = userInfo.email || '';
        url = userInfo.url || '';
      }
    } catch (e) {
      console.warn('Failed to load user info from localStorage:', e);
    }
  }

  function saveUserInfoToStorage() {
    try {
      const userInfo = { author, email, url };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
    } catch (e) {
      console.warn('Failed to save user info to localStorage:', e);
    }
  }

  function getWordCount(text: string): { chars: number; words: number } {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  }

  function isContentWithinLimit(text: string): boolean {
    const { chars, words } = getWordCount(text);
    return chars <= 2000 && words <= 1000;
  }

  async function loadComments() {
    loading = true;
    try {
      const res = await fetch(
        `${apiUrl}/api/comments?post_slug=${encodeURIComponent(postSlug)}&nested=true&page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error(uiText.comments.loadFailed);
      const data = await res.json();
      comments = data.data;
      hasMore = data.pagination.total > page * limit;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function submitComment(parentId: number | null = null, replyData: any = null) {
    if (submitting) return;

    let submitAuthor;
    let submitEmail;
    let submitUrl;
    let submitContent;

    if (replyData) {
      submitAuthor = replyData.author;
      submitEmail = replyData.email;
      submitUrl = replyData.url;
      submitContent = replyData.content;
    } else {
      submitAuthor = author;
      submitEmail = email;
      submitUrl = url;
      submitContent = content;
    }

    if (!submitAuthor || !submitEmail || !submitContent) {
      alert(uiText.comments.fillRequired);
      return;
    }

    if (!isContentWithinLimit(submitContent)) {
      alert(uiText.comments.contentTooLong);
      return;
    }

    if (!parentId) {
      submitting = true;
    }

    try {
      const res = await fetch(`${apiUrl}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_slug: postSlug,
          author: submitAuthor,
          email: submitEmail,
          url: submitUrl || null,
          content: submitContent,
          parent_id: parentId,
          post_url: window.location.href,
          post_title: postTitle,
        }),
      });
      const data = await res.json();
      alert(data.message || uiText.comments.submitSuccess);

      if (!replyData) {
        content = '';
        saveUserInfoToStorage();
      }
      replyingToId = null;
      await loadComments();
    } catch (err) {
      alert(uiText.comments.submitFailed);
    } finally {
      if (!parentId) {
        submitting = false;
      }
    }
  }

  async function handleCommentDelete() {
    await loadComments();
  }

  function setReplyingTo(id: number | null) {
    replyingToId = id;
  }

  onMount(() => {
    loadUserInfoFromStorage();
    loadComments();
  });
</script>

<div class="mt-4 max-w-3xl mx-auto border-t border-[var(--button-border-color)]" id="comments">
  <div data-aos="fade-up" class="mt-4">
    <form on:submit|preventDefault={() => submitComment()} class="space-y-4">
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label for="author" class="block text-sm text-[var(--text-color)] mb-1">{uiText.comments.name}<span class="text-red-500">*</span></label>
          <input id="author" type="text" placeholder={uiText.comments.required} bind:value={author}
            class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-2" />
        </div>
        <div>
          <label for="email" class="block text-sm text-[var(--text-color)] mb-1">{uiText.comments.email}<span class="text-red-500">*</span></label>
          <input id="email" type="email" placeholder={uiText.comments.required} bind:value={email}
            class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-2" />
        </div>
        <div>
          <label for="url" class="block text-sm text-[var(--text-color)] mb-1">{uiText.comments.site}</label>
          <input id="url" type="url" placeholder={uiText.comments.optional} bind:value={url}
            class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-2" />
        </div>
      </div>

      <div>
        <textarea placeholder={uiText.comments.welcome}
          class="rounded w-full border text-[var(--text-color)] border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-3 min-h-[100px]"
          bind:value={content}></textarea>
        <div class="text-right text-sm text-[var(--text-color-70)] mt-1">
          {#if !isContentWithinLimit(content)}
            <span class="text-red-500 ml-2">{uiText.comments.contentTooLong}</span>
          {/if}
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="submit" disabled={submitting || !isContentWithinLimit(content)}
          class="rounded px-4 py-2 text-sm font-medium text-[var(--text-color)] border border-[var(--button-border-color)] hover:bg-[var(--button-hover-color)] disabled:opacity-50">
          {submitting ? uiText.comments.sending : uiText.comments.send}
        </button>
      </div>
    </form>
  </div>

  <div id="comments-content">
    {#if loading}
      <p data-aos="fade-up" class="text-[var(--text-color)] text-center">{uiText.comments.loading}</p>
    {:else if error}
      <p data-aos="fade-up" class="text-red-500 text-center">{uiText.comments.loadFailed}：{error}</p>
    {:else}
      <h4 data-aos="fade-up" class="text-[var(--text-color)] text-base font-semibold mb-4">{comments.length} {uiText.comments.comments}</h4>

      <div class="space-y-6">
        {#each comments as c}
          <CommentItem
            {c}
            {postSlug}
            {author}
            {email}
            {url}
            on:reply={(e) => setReplyingTo(e.detail)}
            on:cancel={() => setReplyingTo(null)}
            on:submit={async (e) => {
              await submitComment(e.detail.parentId, e.detail);
            }}
            on:delete={handleCommentDelete}
            replyingToId={replyingToId}
          />
        {/each}
      </div>

      {#if hasMore}
        <div data-aos="fade-up" class="flex justify-center mt-6">
          <button on:click={() => { page++; loadComments(); }} class="text-indigo-600 hover:underline text-sm">
            {uiText.comments.loadMore}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
