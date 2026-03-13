import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { CONTENT_ENTRY_LANG } from '@constants/site';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getBlogEntrySort(
  filter?: (entry: CollectionEntry<'blog'>) => boolean | undefined,
  sort?: (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => number
): Promise<BlogEntry[]> {
  const defaultFilter = ({ data }: CollectionEntry<'blog'>) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  };

  const defaultSort = (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => {
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  };

  const blogEntries = await getCollection('blog', filter || defaultFilter);

  const selectedEntries = blogEntries
    .map((post) => {
      const normalizedId = post.id.replace(/\\/g, '/');
      const parts = normalizedId.split('/');
      const fileName = parts[parts.length - 1]?.replace(/\.md$/, '');

      if (fileName !== CONTENT_ENTRY_LANG) {
        return null;
      }

      return {
        ...post,
        id: parts.slice(0, -1).join('/'),
      };
    })
    .filter((post): post is BlogEntry => Boolean(post));

  return selectedEntries.sort(sort || defaultSort);
}

export async function getSpec(spec: string) {
  return getEntry('spec', `${spec}/${CONTENT_ENTRY_LANG}`);
}
