<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CommentItem from './CommentItem.svelte';
  import { formatFullDate } from '@/utils/time';
  import { uiText } from '@constants/ui-text';

  export let c: any;
  export let postSlug: string;
  export let replyingToId: number | null = null;
  export let author: string = '';
  export let email: string = '';
  export let url: string = '';

  let replyAuthor = '';
  let replyEmail = '';
  let replyUrl = '';
  let replyContent = '';
  let replySubmitting = false;

  const dispatch = createEventDispatcher();
  const avatarUrl = c.avatar;

  function getWordCount(text: string): { chars: number; words: number } {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  }

  function isContentWithinLimit(text: string): boolean {
    const { chars, words } = getWordCount(text);
    return chars <= 2000 && words <= 1000;
  }

  function isValidHtml(str: string): boolean {
    if (!str.includes('<') || !str.includes('>')) return false;
    const tagRegex = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/i;
    return tagRegex.test(str);
  }
</script>

<div data-aos="fade-up" class="flex gap-3 w-full max-w-full">
  {#if c.url}
    <a href={c.url} target="_blank" class="w-10 h-10">
      <img src={avatarUrl} alt="avatar" class="w-10 h-10" />
    </a>
  {:else}
    <img src={avatarUrl} alt="avatar" class="w-10 h-10" />
  {/if}

  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <span class="font-semibold text-[var(--text-color)]">{c.author}</span>
      <span class="text-sm text-[var(--text-color-70)]">{formatFullDate(new Date(c.pubDate))}</span>
    </div>

    <div class="text-[var(--text-color)] mt-1 leading-relaxed w-full max-w-full min-w-0">
      {#if c.contentHtml && typeof c.contentHtml === 'string' && isValidHtml(c.contentHtml)}
        <div innerHTML={c.contentHtml} class="break-words w-full max-w-full"></div>
      {:else if c.contentText && typeof c.contentText === 'string' && c.contentText.trim() !== ''}
        <p class="break-words whitespace-pre-wrap overflow-hidden w-full max-w-full min-w-0">
          {c.contentText}
        </p>
      {:else if c.contentHtml && typeof c.contentHtml === 'string' && c.contentHtml.trim() !== ''}
        <p class="break-words whitespace-pre-wrap overflow-hidden w-full max-w-full min-w-0">
          {c.contentHtml}
        </p>
      {:else}
        <p class="break-words whitespace-pre-wrap overflow-hidden w-full max-w-full min-w-0 text-gray-500">
          {uiText.comments.noContent}
        </p>
      {/if}
    </div>

    <div class="mt-1 flex items-center gap-4 text-sm text-[var(--text-color)]">
      <button on:click={() => {
        dispatch('reply', c.id);
        replyAuthor = author;
        replyEmail = email;
        replyUrl = url;
      }} class="hover:text-[var(--link-color)]">
        {uiText.comments.reply}
      </button>
    </div>

    {#if replyingToId === c.id}
      <div class="mt-4 pl-4 border-l-2 border-gray-200">
        <form on:submit|preventDefault={() => {
          if (replySubmitting) return;

          if (!replyAuthor || !replyEmail || !replyContent) {
            alert(uiText.comments.fillRequired);
            return;
          }

          if (!isContentWithinLimit(replyContent)) {
            alert(uiText.comments.contentTooLong);
            return;
          }

          replySubmitting = true;
          dispatch('submit', {
            parentId: c.id,
            author: replyAuthor,
            email: replyEmail,
            url: replyUrl,
            content: replyContent,
            post_url: window.location.href,
          });
          replyContent = '';
        }} class="space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label for="reply-author-{c.id}" class="block text-xs text-[var(--text-color)] mb-1">{uiText.comments.name}<span class="text-red-500">*</span></label>
              <input id="reply-author-{c.id}" type="text" placeholder={uiText.comments.required} bind:value={replyAuthor}
                class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-1" />
            </div>
            <div>
              <label for="reply-email-{c.id}" class="block text-xs text-[var(--text-color)] mb-1">{uiText.comments.email}<span class="text-red-500">*</span></label>
              <input id="reply-email-{c.id}" type="email" placeholder={uiText.comments.required} bind:value={replyEmail}
                class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-1" />
            </div>
            <div>
              <label for="reply-url-{c.id}" class="block text-xs text-[var(--text-color)] mb-1">{uiText.comments.site}</label>
              <input id="reply-url-{c.id}" type="url" placeholder={uiText.comments.optional} bind:value={replyUrl}
                class="rounded w-full text-[var(--text-color)] border border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-1" />
            </div>
          </div>

          <div>
            <textarea placeholder={uiText.comments.replyPlaceholder}
              class="rounded w-full border text-[var(--text-color)] border-[var(--button-border-color)] focus:outline-none focus:border-[var(--link-color)] text-sm p-2 min-h-[80px]"
              bind:value={replyContent}></textarea>
            <div class="text-right text-xs text-[var(--text-color-70)] mt-1">
              {#if !isContentWithinLimit(replyContent)}
                <span class="text-red-500 ml-2">{uiText.comments.contentTooLong}</span>
              {/if}
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" on:click={() => {
              dispatch('cancel');
              replySubmitting = false;
            }} class="rounded px-3 py-1 text-sm text-[var(--text-color)] border border-[var(--button-border-color)] hover:bg-[var(--button-hover-color)]">
              {uiText.comments.cancel}
            </button>
            <button type="submit" disabled={replySubmitting || !isContentWithinLimit(replyContent)} class="rounded px-3 py-1 text-sm font-medium text-[var(--text-color)] border border-[var(--button-border-color)] hover:bg-[var(--button-hover-color)] disabled:opacity-50">
              {replySubmitting ? uiText.comments.sending : uiText.comments.reply}
            </button>
          </div>
        </form>
      </div>
    {/if}

    {#if c.replies && c.replies.length}
      <div class="pl-6 mt-4 border-l border-[var(--text-color)]/50 space-y-4 w-full">
        {#each c.replies as reply}
          <div class="w-full max-w-full overflow-hidden">
            <CommentItem
              c={reply}
              {postSlug}
              {author}
              {email}
              {url}
              on:reply={(e) => dispatch('reply', e.detail)}
              on:cancel={() => dispatch('cancel')}
              on:submit={(e) => dispatch('submit', e.detail)}
              on:delete={(e) => dispatch('delete', e.detail)}
              replyingToId={replyingToId}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
