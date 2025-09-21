import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/entities/User';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const mapPushupsToScore = (count) => {
    if (isNaN(count) || count < 0) return 0;
    if (count <= 5) return 1; if (count <= 10) return 2;
    if (count <= 15) return 3; if (count <= 20) return 4;
    if (count <= 30) return 5; if (count <= 40) return 6;
    if (count <= 50) return 7; if (count <= 60) return 8;
    if (count <= 70) return 9;
    return 10;
};

const mapPullupsToScore = (count) => {
    if (isNaN(count) || count < 0) return 0;
    if (count <= 1) return 1; if (count <= 2) return 2;
    if (count <= 4) return 3; if (count <= 6) return 4;
    if (count <= 8) return 5; if (count <= 12) return 6;
    if (count <= 15) return 7; if (count <= 20) return 8;
    if (count <= 25) return 9;
    return 10;
};

const mapRunTimeToScore = (timeStr) => {
    let totalSeconds;
    if (String(timeStr).includes(':')) {
        const parts = String(timeStr).split(':');
        totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else {
        totalSeconds = parseFloat(timeStr) * 60;
    }
    if (isNaN(totalSeconds)) return 0;

    if (totalSeconds <= 10 * 60 + 30) return 10;
    if (totalSeconds <= 11 * 60) return 9;
    if (totalSeconds <= 11 * 60 + 30) return 8;
    if (totalSeconds <= 12 * 60) return 7;
    if (totalSeconds <= 14 * 60) return 6;
    if (totalSeconds <= 16 * 60) return 5;
    if (totalSeconds <= 18 * 60) return 4;
    if (totalSeconds <= 21 * 60) return 3;
    if (totalSeconds <= 23 * 60) return 2;
    if (totalSeconds <= 25 * 60) return 1;
    return 0;
};

export default function AssessmentWorkout() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ pushups: '', pullups: '', runTime: '' });
    const [errors, setErrors] = useState({ pushups: '', pullups: '', runTime: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const validate = () => {
        let isValid = true;
        const newErrors = { pushups: '', pullups: '', runTime: '' };

        if (!formData.pushups || isNaN(Number(formData.pushups)) || Number(formData.pushups) < 0) {
            newErrors.pushups = 'הזן מספר חוקי';
            isValid = false;
        }
        if (!formData.pullups || isNaN(Number(formData.pullups)) || Number(formData.pullups) < 0) {
            newErrors.pullups = 'הזן מספר חוקי';
            isValid = false;
        }
        if (!formData.runTime) {
            newErrors.runTime = 'הזן תוצאה';
            isValid = false;
        } else if (!/^\d{1,2}([:.]\d{1,2})?$/.test(formData.runTime)) {
             newErrors.runTime = 'פורמט לא חוקי (הזן דקות או דק:שנ)';
             isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsLoading(true);

        const performanceData = {
            push_strength: mapPushupsToScore(Number(formData.pushups)),
            pull_strength: mapPullupsToScore(Number(formData.pullups)),
            cardio_endurance: mapRunTimeToScore(formData.runTime),
            running_volume: 0,
            rucking_volume: 0,
            weight_work: 0,
        };

        try {
            await User.updateMyUserData(performanceData);
            setIsComplete(true);
            setTimeout(() => navigate(createPageUrl("Home")), 2000);
        } catch (error) {
            console.error("Failed to update user profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-light-sand p-6 flex flex-col items-center justify-center text-center text-dark-olive" dir="rtl">
                <CheckCircle className="w-16 h-16 text-idf-olive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">הפרופיל עודכן!</h1>
                <p className="text-gray-600">מעביר אותך למסך הראשי...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-light-sand p-6 flex flex-col items-center justify-center text-dark-olive" dir="rtl">
             <div className="w-full max-w-md">
                <div className="flex items-center gap-4 mb-8">
                    <Link to={createPageUrl("Home")}>
                        <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
                        <ArrowLeft className="w-6 h-6 text-dark-olive" />
                        </button>
                    </Link>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-dark-olive">מבחן בראור מקוצר</h1>
                        <p className="text-gray-600">הזן את התוצאות שלך לאחר ביצוע המבחן.</p>
                    </div>
                </div>
                
                <div className="space-y-4 text-right">
                     <div>
                        <label className="font-semibold text-idf-olive">תוצאה בריצת 3000 מטר</label>
                        <Input type="text" value={formData.runTime} onChange={(e) => setFormData({...formData, runTime: e.target.value})} className="bg-white text-center" placeholder="דקות:שניות (למשל 12:30)" />
                        {errors.runTime && <p className="text-red-500 text-xs mt-1">{errors.runTime}</p>}
                    </div>
                    <div>
                        <label className="font-semibold text-idf-olive">מקסימום מתח (ברצף)</label>
                        <Input type="number" value={formData.pullups} onChange={(e) => setFormData({...formData, pullups: e.target.value})} className="bg-white text-center" placeholder="0" />
                         {errors.pullups && <p className="text-red-500 text-xs mt-1">{errors.pullups}</p>}
                    </div>
                    <div>
                        <label className="font-semibold text-idf-olive">מקסימום שכיבות סמיכה (ברצף)</label>
                        <Input type="number" value={formData.pushups} onChange={(e) => setFormData({...formData, pushups: e.target.value})} className="bg-white text-center" placeholder="0" />
                        {errors.pushups && <p className="text-red-500 text-xs mt-1">{errors.pushups}</p>}
                    </div>
                </div>

                <div className="mt-8">
                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-idf-olive text-light-sand btn-press text-lg py-6">
                        {isLoading ? 'מעדכן פרופיל...' : 'סיימתי, עדכן פרופיל'}
                    </Button>
                </div>
            </div>
        </div>
    );
}