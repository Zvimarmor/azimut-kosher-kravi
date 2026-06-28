import React from 'react';
import { Navigation, WifiOff } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  language?: 'hebrew' | 'english' | 'spanish';
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

const MESSAGES: Record<string, { title: string; subtitle: string }> = {
  hebrew: {
    title: 'GPS אינו זמין',
    subtitle: 'האימון ימשיך ללא מעקב מיקום',
  },
  english: {
    title: 'GPS Unavailable',
    subtitle: 'Workout continues without location tracking',
  },
  spanish: {
    title: 'GPS no disponible',
    subtitle: 'El entrenamiento continúa sin seguimiento de ubicación',
  },
};

export class GPSErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[GPSErrorBoundary] GPS component error caught:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const lang = this.props.language || 'english';
      const msg = MESSAGES[lang] || MESSAGES.english;

      return (
        <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 glass-card rounded-2xl text-center">
          <div className="relative">
            <Navigation className="w-8 h-8 text-tactical-muted opacity-40" />
            <WifiOff className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <p className="text-sm font-semibold text-tactical-text">{msg.title}</p>
            <p className="text-xs text-tactical-muted mt-0.5">{msg.subtitle}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
