export interface HeritageStoryData {
  title: string;
  content: string;
  author: string;
  category: 'PastBattles' | 'FallenSoldiers' | 'MilitaryConcepts' | 'PhilosophyAndJudaism';
  dateWritten?: string;
  imageUrl?: string;
  tags?: string[];
}

// Parse CSV data
function parseCSV(csvText: string): HeritageStoryData[] {
  const lines = csvText.split('\n');
  const stories: HeritageStoryData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with quoted fields
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value

    if (values.length >= 4) {
      const story: HeritageStoryData = {
        title: values[0] || '',
        content: values[1] || '',
        author: values[2] || '',
        category: (values[3] || 'PhilosophyAndJudaism') as any,
      };
      stories.push(story);
    }
  }

  return stories;
}

let cachedStories: HeritageStoryData[] | null = null;

export class HeritageStory {
  static async list(): Promise<HeritageStoryData[]> {
    if (cachedStories) {
      return cachedStories;
    }

    try {
      const response = await fetch('/data/HeritageStory.csv');
      const csvText = await response.text();
      cachedStories = parseCSV(csvText);
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
