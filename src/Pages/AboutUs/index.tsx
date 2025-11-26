import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Shield, Heart } from "lucide-react";
import { LanguageContext } from "../../components/shared/LanguageContext";

const pageTexts = {
  hebrew: {
    title: "קצת עלינו",
    subtitle: "נבנה באהבה ובתשוקה לכושר קרבי.",
    ourStory: "הסיפור שלנו",
    storyContent: "אנחנו צ׳ ומ׳. שירתנו בשירות סדיר וקבע ביחידת אגוז, והשתתפנו בעשרות פעילויות ומשימות בשטחי אויב שיפה להן השתיקה.\n\nכושר וכושר קרבי הוא חלק גדול מהחיים שלנו, ועיסוקנו ביום יום הוא הדרכת נוער לשירות קרבי משמעותי בצה״ל וביחידות המובחרות של צה״ל.",
    ourMission: "המשימה שלנו",
    missionContent: "היום קבוצות כושר קרבי הפכו לסטנדרט. בין אם בגיבושים ובין אם ביחידות המובחרות וביחידות המיוחדות, כמעט כולם היו חלק מקבוצת כושר קרבי כזו או אחרת.\n\nאנחנו, שיודעים כמה זה יכול להיות יקר, וכמה לפעמים יש קושי טכני בלהצטרף לקבוצה - בין אם מרחק, זמן, או מחיר - רצינו לאפשר אפשרות זולה יותר, נוחה יותר, ומותאמת יותר אישית לכל מתאמן.\n\nכחלק מזה פיתחנו את אפליקציית אזימוט כושר קרבי, שאחראית ומאפשרת לקחת אתכם מהנקודה בה אתם נמצאים אל הנקודה בה אתם רוצים להיות מבחינת הכושר שלכם, בצורה הכי נוחה, הכי זולה, והכי מותאמת אישית שיש.\n\nאנחנו מאמינים שעם הכלים הנכונים, כל אחד יכול להגיע לכל מטרה שהוא מציב לעצמו, ואנחנו כאן כדי לעזור לכם לעשות את זה.",
    theTeam: "הצוות",
    teamContent: "צ׳ - לוחם ומפקד ביחידת אגוז. מילואימניק בחטיבת המילואים של יחידת אגוז (מעל 200 ימי מילואים מאז השביעי לאוקטובר). בנוסף, בעל עבר בריצות תחרותיות ותחרויות שונות.\n\nמ׳ - לוחם וצלף ביחידת אגוז. משרת במילואים יחד עם צ׳ בחטיבת המילואים של אגוז. בעל תעודת מדריך ריצות וחדר כושר מוסמך.",
    memorial: "פרויקט זה מוקדש לזכרם של אופק בכר ושילה הר-אבן ז\"ל. יהי זכרם ברוך.",
    backHome: "חזרה למסך הבית"
  },
  english: {
    title: "About Us",
    subtitle: "Built with love and passion for combat fitness.",
    ourStory: "Our Story",
    storyContent: "We are T and M. We served in regular and career service in the Egoz Unit, and participated in dozens of operations and missions in enemy territory that deserve silence.\n\nFitness and combat fitness is a huge part of our lives, and our daily occupation is training youth for meaningful combat service in the IDF and in the IDF's elite units.",
    ourMission: "Our Mission",
    missionContent: "Today, combat fitness groups have become the standard. Whether in selection processes or in elite and special units, almost everyone has been part of one combat fitness group or another.\n\nWe, who know how expensive it can be, and how sometimes there are technical difficulties in joining a group - whether distance, time, or price - wanted to provide a cheaper, more convenient, and more personally tailored option for every trainee.\n\nAs part of this, we developed the Azimut Combat Fitness app, which is responsible for and enables taking you from where you are to where you want to be in terms of your fitness, in the most convenient, cheapest, and most personally tailored way possible.\n\nWe believe that with the right tools, anyone can reach any goal they set for themselves, and we're here to help you do it.",
    theTeam: "The Team",
    teamContent: "T - Fighter and commander in the Egoz Unit. Reservist in the Egoz Unit's reserve brigade (over 200 days of reserve duty since October 7th). Additionally, has a background in competitive running and various competitions.\n\nM - Fighter and sniper in the Egoz Unit. Serves in reserves together with T in the Egoz reserve brigade. Holds a certified running and gym instructor certificate.",
    memorial: "This project is lovingly dedicated to the memory of Ofek Becher and Shilo Har-Even. May their memory be a blessing.",
    backHome: "Back to Home"
  }
};

export default function AboutUs() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const currentTexts = pageTexts[language];

  return (
    <div className="min-h-screen px-6 py-8" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className={`flex items-center gap-4 mb-8 ${language === 'hebrew' ? 'flex-row-reverse' : ''}`}>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="text-[var(--color-4)] hover:text-white hover:bg-[var(--color-2)]/30 p-2">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className={language === 'hebrew' ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[var(--color-4)] flex items-center gap-2">
              <Shield className="w-7 h-7 text-[var(--color-3)]" />
              {currentTexts.title}
            </h1>
            <p className="text-[var(--color-3)]/70 text-sm">{currentTexts.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Our Story Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.ourStory}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.storyContent}
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.ourMission}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.missionContent}
            </div>
          </div>

          {/* The Team Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.theTeam}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.teamContent}
            </div>
          </div>

          {/* Memorial Section */}
          <div className="text-center p-6 rounded-xl bg-black/40 border border-[var(--color-2)]/30">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-[var(--color-3)]/80 text-base leading-relaxed">{currentTexts.memorial}</p>
          </div>

          <Link to={createPageUrl("Home")} className="block pt-4">
             <Button variant="outline" className="w-full border-[var(--color-2)]/50 text-[var(--color-3)] hover:bg-[var(--color-2)]/30 hover:text-[var(--color-4)] font-medium py-3 rounded-xl">
                {currentTexts.backHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
