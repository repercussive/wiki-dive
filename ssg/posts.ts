import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const featuredPosts: string[] = [];

export const postCategories = [
  'animals',
  'catastrophe',
  'history',
  'internet',
  'language',
  'medicine',
  'miscellaneous',
  'nature',
  'people',
  'places',
  'politics',
  'psychology',
  'science',
  'society',
  'space',
  'technology',
  'meta'] as const;

export type PostCategory = typeof postCategories[number];

export type PostMetadata = {
  slug: string,
  index: number,
  title: string,
  description: string,
  date: string,
  articleUrl: string,
  tags: PostCategory[]
}

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllPostsData() {
  const buildTime = Date.now();
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .map(fileName => {
      const slug = fileName.replace('.md', '');
      const metadata = getPostDataBySlug(slug).metadata;

      if (new Date(metadata.date).valueOf() > buildTime) {
        return null;
      }

      return {
        slug,
        ...metadata,
      } as PostMetadata
    })
    .filter(postData => postData !== null);

  return allPostsData.sort((a, b) => a.date < b.date ? 1 : -1);
}

export function getHomepageData() {
  const allPostsData = getAllPostsData();

  return {
    recentPostsData: allPostsData.splice(0, 24),
    featuredPostsData: featuredPosts.map(slug => getPostDataBySlug(slug).metadata)
  }
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        slug: fileName.replace('.md', '')
      }
    }
  });
}

export function getPostDataBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const markdown = matter(fileContents);
  return {
    metadata: { slug, ...markdown.data } as PostMetadata,
    content: markdown.content
  }
}