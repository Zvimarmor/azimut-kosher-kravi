import { fetchCSV, type CSVRow } from '../lib/utils/csvParser';

export interface HeritageStoryData {
  title: string;
  content: string;
  author: string;
  category: 'PastBattles' | 'FallenSoldiers' | 'MilitaryConcepts' | 'PhilosophyAndJudaism';
  dateWritten?: string;
  imageUrl?: string;
  tags?: string[];
}

// Transform CSV row to HeritageStoryData
function transformCSVToHeritageStory(row: CSVRow): HeritageStoryData {
  return {
    title: row.title || '',
    content: row.content || '',
    author: row.author || '',
    category: (row.category || 'PhilosophyAndJudaism') as HeritageStoryData['category'],
    dateWritten: row.dateWritten || undefined,
    imageUrl: row.imageUrl || undefined,
    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : undefined,
  };
}

let cachedStories: HeritageStoryData[] | null = null;

export class HeritageStory {
  static async list(): Promise<HeritageStoryData[]> {
    if (cachedStories) {
      return cachedStories;
    }

    try {
      const csvData = await fetchCSV('HeritageStory.csv');
      cachedStories = csvData.map(transformCSVToHeritageStory).filter(story => story.title);
      return cachedStories;
    } catch (error) {
      console.error('Error loading heritage stories:', error);
      return [];
    }
  }

  static async filter({ category }: { category: string }): Promise<HeritageStoryData[]> {
    const allStories = await this.list();
    return allStories.filter(story => story.category === category);
  }
}

export class HeritageStoryService {
  static createStory(data: Partial<HeritageStoryData>): HeritageStoryData {
    return {
      title: data.title || '',
      content: data.content || '',
      author: data.author || '',
      category: data.category || 'PhilosophyAndJudaism',
      dateWritten: data.dateWritten,
      imageUrl: data.imageUrl,
      tags: data.tags || []
    };
  }

  static validateStory(story: Partial<HeritageStoryData>): boolean {
    return !!(story.title && story.content && story.author && story.category);
  }
}
