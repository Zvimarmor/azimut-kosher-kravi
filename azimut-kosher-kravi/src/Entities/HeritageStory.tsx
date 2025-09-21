export interface HeritageStory {
  title: string;
  content: string;
  author: string;
  category: 'PastBattles' | 'Heroes' | 'Traditions' | 'Values';
  dateWritten?: string;
  imageUrl?: string;
  tags?: string[];
}

export class HeritageStoryService {
  static createStory(data: Partial<HeritageStory>): HeritageStory {
    return {
      title: data.title || '',
      content: data.content || '',
      author: data.author || '',
      category: data.category || 'Values',
      dateWritten: data.dateWritten,
      imageUrl: data.imageUrl,
      tags: data.tags || []
    };
  }

  static validateStory(story: Partial<HeritageStory>): boolean {
    return !!(story.title && story.content && story.author && story.category);
  }
}