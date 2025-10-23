import { AlertTriangle, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GPSWarningModalProps {
  language: 'hebrew' | 'english';
  onContinueWithoutGPS: () => void;
  onWaitForGPS: () => void;
  warningType: 'unavailable' | 'poor_signal';
}

export function GPSWarningModal({
  language,
  onContinueWithoutGPS,
  onWaitForGPS,
  warningType
}: GPSWarningModalProps) {
  const isUnavailable = warningType === 'unavailable';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            {language === 'hebrew'
              ? (isUnavailable ? 'GPS לא זמין' : 'אות GPS חלש')
              : (isUnavailable ? 'GPS Unavailable' : 'Weak GPS Signal')
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              {language === 'hebrew'
                ? (isUnavailable
                    ? 'לא ניתן לגשת לשירותי המיקום. מעקב אחר מרחק וקצב לא יהיה זמין באימון זה.'
                    : 'אות ה-GPS חלש מדי למעקב מדויק. מומלץ לחכות לאות טוב יותר או לעבור למקום פתוח.'
                  )
                : (isUnavailable
                    ? 'Unable to access location services. Distance and pace tracking will not be available for this workout.'
                    : 'GPS signal is too weak for accurate tracking. We recommend waiting for better signal or moving to an open area.'
                  )
              }
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold">
              {language === 'hebrew' ? 'מה ברצונך לעשות?' : 'What would you like to do?'}
            </p>
            {!isUnavailable && (
              <ul className="list-disc list-inside space-y-1 mr-4 text-xs">
                <li>{language === 'hebrew' ? 'צא למקום פתוח (מרחק מבניינים)' : 'Move to an open area (away from buildings)'}</li>
                <li>{language === 'hebrew' ? 'וודא שה-GPS מופעל במכשיר' : 'Ensure GPS is enabled on your device'}</li>
                <li>{language === 'hebrew' ? 'המתן מספר שניות לאיתור לוויינים' : 'Wait a few seconds for satellite lock'}</li>
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onContinueWithoutGPS}
              variant="outline"
              className="flex-1 btn-press"
            >
              {language === 'hebrew' ? 'המשך ללא GPS' : 'Continue Without GPS'}
            </Button>
            <Button
              onClick={onWaitForGPS}
              className="flex-1 bg-[var(--color-accent-primary)] text-white btn-press"
            >
              {language === 'hebrew' ? 'נסה שוב' : 'Try Again'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {language === 'hebrew'
              ? 'ניתן להמשיך את האימון גם ללא GPS, אך מעקב המרחק לא יהיה זמין'
              : 'You can continue the workout without GPS, but distance tracking will not be available'
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
