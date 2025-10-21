import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { DataService } from '../../lib/services/DataService';
import type { Warmup } from '../../Entities/Warmup';
import type { StrengthExplosive } from '../../Entities/StrengthExplosive';
import type { RunningEndurance } from '../../Entities/RunningEndurance';
import type { Special } from '../../Entities/Special';
import { HeritageStory, type HeritageStoryData } from '../../Entities/HeritageStory';

type WorkoutType = 'warmup' | 'strength' | 'running' | 'special' | 'heritage';
type WorkoutData = Warmup | StrengthExplosive | RunningEndurance | Special | HeritageStoryData;

const TEXTS = {
  hebrew: {
    title: 'ממשק ניהול נתונים',
    subtitle: 'ערוך אימונים וסיפורי מורשת',
    selectType: 'בחר סוג נתונים',
    warmup: 'חימום',
    strength: 'כוח והתפרצות',
    running: 'ריצה וסיבולת',
    special: 'מיוחד/טקטי',
    heritage: 'סיפורי מורשת',
    loading: 'טוען נתונים...',
    error: 'שגיאה בטעינת נתונים',
    refresh: 'רענן נתונים',
    exportCSV: 'ייצא ל-CSV',
    total: 'סה"כ פריטים',
    id: 'מזהה',
    title_field: 'כותרת',
    difficulty: 'רמת קושי',
    duration: 'משך (דקות)',
    category: 'קטגוריה',
    author: 'מחבר',
    instructions: 'הוראות',
    edit: 'ערוך',
    close: 'סגור',
    save: 'שמור',
    cancel: 'ביטול',
    editItem: 'עריכת פריט',
    noData: 'אין נתונים להצגה',
  },
  english: {
    title: 'Data Management Interface',
    subtitle: 'Edit Workouts and Heritage Stories',
    selectType: 'Select Data Type',
    warmup: 'Warmup',
    strength: 'Strength & Explosive',
    running: 'Running & Endurance',
    special: 'Special/Tactical',
    heritage: 'Heritage Stories',
    loading: 'Loading data...',
    error: 'Error loading data',
    refresh: 'Refresh Data',
    exportCSV: 'Export to CSV',
    total: 'Total Items',
    id: 'ID',
    title_field: 'Title',
    difficulty: 'Difficulty',
    duration: 'Duration (min)',
    category: 'Category',
    author: 'Author',
    instructions: 'Instructions',
    edit: 'Edit',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    editItem: 'Edit Item',
    noData: 'No data to display',
  },
};

export default function Admin() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = TEXTS[language];

  const [selectedType, setSelectedType] = useState<WorkoutType>('warmup');
  const [data, setData] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<WorkoutData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      let result: WorkoutData[] = [];

      switch (selectedType) {
        case 'warmup':
          result = await DataService.getWarmups();
          break;
        case 'strength':
          result = await DataService.getStrengthExplosive();
          break;
        case 'running':
          result = await DataService.getRunningEndurance();
          break;
        case 'special':
          result = await DataService.getSpecial();
          break;
        case 'heritage':
          result = await HeritageStory.list();
          break;
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    DataService.clearCache();
    loadData();
  };

  const handleEdit = (item: WorkoutData) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSave = () => {
    // Note: This is a UI-only save. To actually save to CSV, you would need
    // a backend API endpoint that can write to the CSV files
    alert('Note: Saving to CSV requires a backend endpoint. This is a display-only interface for now.');
    setShowEditModal(false);
    setEditingItem(null);
  };

  const exportToCSV = () => {
    // Convert data to CSV format
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(value => {
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}_export.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t.selectType}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(['warmup', 'strength', 'running', 'special', 'heritage'] as WorkoutType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
          >
            <span>🔄</span> {t.refresh}
          </button>
          <button
            onClick={exportToCSV}
            disabled={data.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>📥</span> {t.exportCSV}
          </button>
          <div className="ml-auto flex items-center gap-2 text-gray-400">
            {t.total}: <span className="font-bold text-white">{data.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>{t.loading}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/50 text-red-200">
              {t.error}: {error}
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              {t.noData}
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t.id}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">{t.title_field}</th>
                    {selectedType !== 'heritage' && (
                      <th className="px-4 py-3 text-left text-sm font-medium">{t.difficulty}</th>
                    )}
                    {selectedType === 'heritage' && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t.author}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t.category}</th>
                      </>
                    )}
                    {selectedType !== 'heritage' && (
                      <th className="px-4 py-3 text-left text-sm font-medium">{t.duration}</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium">{t.instructions}</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">{t.edit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-700/50 transition">
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {('id' in item ? item.id : '') || index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {'title' in item ? item.title : ''}
                      </td>
                      {selectedType !== 'heritage' && (
                        <td className="px-4 py-3 text-sm">
                          {'difficulty' in item ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.difficulty === 'beginner' ? 'bg-green-900 text-green-200' :
                              item.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-red-900 text-red-200'
                            }`}>
                              {item.difficulty}
                            </span>
                          ) : '-'}
                        </td>
                      )}
                      {selectedType === 'heritage' && (
                        <>
                          <td className="px-4 py-3 text-sm">
                            {'author' in item ? item.author : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {'category' in item ? item.category : '-'}
                          </td>
                        </>
                      )}
                      {selectedType !== 'heritage' && (
                        <td className="px-4 py-3 text-sm">
                          {'duration' in item ? `${item.duration} min` : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-md truncate">
                        {'instructions' in item ? item.instructions :
                         'content' in item ? (item.content as string).substring(0, 100) + '...' : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                        >
                          {t.edit}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t.editItem}</h2>

                <div className="space-y-4">
                  {Object.entries(editingItem).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      {typeof value === 'object' ? (
                        <textarea
                          value={JSON.stringify(value, null, 2)}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-700 rounded text-sm font-mono"
                          rows={5}
                        />
                      ) : typeof value === 'string' && value.length > 100 ? (
                        <textarea
                          value={value}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-700 rounded"
                          rows={6}
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(value)}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-700 rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-2 justify-end">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
