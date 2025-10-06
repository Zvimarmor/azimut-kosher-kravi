import { AlertCircle, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GPSPermissionModalProps {
  language: 'hebrew' | 'english';
  onRequestPermission: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GPSPermissionModal({
  language,
  onRequestPermission,
  onCancel,
  isLoading = false
}: GPSPermissionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-6 h-6 text-[var(--color-accent-primary)]" />
            {language === 'hebrew' ? 'גישה למיקום נדרשת' : 'Location Access Required'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              {language === 'hebrew'
                ? 'כדי לעקוב אחר המרחק והמהירות שלך בזמן ריצה, האפליקציה צריכה גישה למיקום המכשיר שלך.'
                : 'To track your distance and pace during running, the app needs access to your device location.'
              }
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold">
              {language === 'hebrew' ? 'האפליקציה תשתמש במיקום שלך כדי:' : 'The app will use your location to:'}
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>{language === 'hebrew' ? 'לחשב את המרחק שעברת' : 'Calculate distance traveled'}</li>
              <li>{language === 'hebrew' ? 'למדוד את הקצב הממוצע שלך' : 'Measure your average pace'}</li>
              <li>{language === 'hebrew' ? 'לעקוב אחר המהירות הנוכחית' : 'Track current speed'}</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            {language === 'hebrew'
              ? '💡 המיקום שלך נשמר רק במכשיר ואינו משותף או נשלח לשרתים חיצוניים.'
              : '💡 Your location is only stored on your device and is not shared or sent to external servers.'
            }
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 btn-press"
              disabled={isLoading}
            >
              {language === 'hebrew' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={onRequestPermission}
              className="flex-1 bg-[var(--color-accent-primary)] text-white btn-press"
              disabled={isLoading}
            >
              {isLoading
                ? (language === 'hebrew' ? 'מבקש...' : 'Requesting...')
                : (language === 'hebrew' ? 'אפשר גישה' : 'Allow Access')
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
