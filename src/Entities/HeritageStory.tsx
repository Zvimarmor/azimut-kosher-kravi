export interface HeritageStoryData {
  title: string;
  content: string;
  author: string;
  category: 'PastBattles' | 'FallenSoldiers' | 'MilitaryConcepts' | 'PhilosophyAndJudaism';
  dateWritten?: string;
  imageUrl?: string;
  tags?: string[];
}

// Mock heritage stories data
const MOCK_HERITAGE_STORIES: HeritageStoryData[] = [
  {
    title: "מלחמת ששת הימים - כיבוש הר הבית",
    content: "ב-7 ביוני 1967, לאחר קרבות עזים בירושלים, הגיעו חיילי צה\"ל לראשונה מזה כ-2000 שנה להר הבית. הרגע ההיסטורי נחרט לנצח בזיכרון העם היהודי כאשר צנחני צה\"ל הגיעו לכותל המערבי וקיימו שם תפילה מרגשת.\n\nמפקד החטיבה, אלוף מרדכי 'מוטה' גור, הודיע ברדיו: 'הר הבית בידינו!' - משפט שהדהד ברחבי העולם היהודי ונחרט בהיסטוריה.",
    author: "ארכיון צה\"ל",
    category: "PastBattles"
  },
  {
    title: "שילה הר-אבן ז\"ל - מפקד ולוחם",
    content: "שילה הר-אבן נפל ב-7 באוקטובר 2023 בקרב על קיבוץ כפר עזה. שילה שירת כמפקד פלוגה באגוז (יחידת הקומנדו הימי) ולאחר מכן כמפקד פלוגת לוחמים.\n\nשילה האמין שתרבות מנצחת מלחמות - הוא הדגיש תמיד את החשיבות של חינוך, ערכים וזהות יהודית בצבא. מורשתו ממשיכה לחיות בלוחמים שחינך ובערכים שהטמיע.",
    author: "לזכר שילה הר-אבן",
    category: "FallenSoldiers"
  },
  {
    title: "עקרון הריכוז - יסוד בתורת הלחימה",
    content: "עקרון הריכוז הוא אחד מעקרונות המלחמה הבסיסיים בתורת הלחימה של צה\"ל. העקרון קובע כי יש לרכז כוחות עליונים בנקודת ההכרעה - במקום ובזמן הנכונים.\n\nהעקרון מתבטא ברמות שונות: ברמה האסטרטגית, ברמה האופרטיבית וברמה הטקטית. יישום נכון של העקרון מאפשר לכוח קטן יותר לנצח כוח גדול יותר על ידי יצירת עליונות מקומית ברגע המכריע.",
    author: "מרכז דוקטרינה וחדשנות צה\"ל",
    category: "MilitaryConcepts"
  },
  {
    title: "הלכות מלחמת מצוה ומלחמת רשות",
    content: "ההלכה היהודית מבחינה בין מלחמת מצוה למלחמת רשות. מלחמת מצוה היא מלחמה שמחויבים לנהל אותה על פי התורה, כגון מלחמה על הגנת עם ישראל וארץ ישראל.\n\nלעומת זאת, מלחמת רשות היא מלחמה שאין חובה לנהל אותה, ורק המלך יכול להחליט עליה. המושגים הללו רלוונטיים גם היום בהקשר של ביטחון ישראל והצדקה מוסרית למלחמות.",
    author: "מקורות יהודיים בביטחון",
    category: "PhilosophyAndJudaism"
  }
];

export class HeritageStory {
  static async list(): Promise<HeritageStoryData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_HERITAGE_STORIES;
  }

  static async filter({ category }: { category: string }): Promise<HeritageStoryData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_HERITAGE_STORIES.filter(story => story.category === category);
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