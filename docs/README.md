# Azimut Kosher Kravi Documentation

Welcome to the Azimut Kosher Kravi documentation. This fitness training application is inspired by IDF special forces training methodologies.

## Documentation Structure

### 📐 Architecture
- [Workout Architecture](./architecture/WORKOUT_ARCHITECTURE.md) - Component-based workout system design
- [Workout Examples](./architecture/WORKOUT_EXAMPLES.md) - Sample workout configurations

### 🚀 Deployment
- [Deployment Strategy](./deployment/DEPLOYMENT_STRATEGY.md) - Production deployment guide
- [Firebase Setup](./deployment/FIREBASE_SETUP.md) - Firebase configuration instructions

### 🔧 Development
- [Bugs](./development/BUGS.md) - Known issues and bug tracking
- [TODO](./development/TODO.md) - Development roadmap and task list

### 🔒 Security
- [Security Audit 2025](./security/SECURITY_AUDIT_2025.md) - Comprehensive security audit report
- [Security Fixes Log](./security/SECURITY_FIXES_LOG.md) - Implementation log of security improvements

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Key Features

- **Component-Based Workouts**: Flexible workout system with parts and components
- **Group Training**: Multi-device synchronized workout sessions
- **Exercise Library**: Comprehensive database with RAG-enabled search
- **AI Military Chat**: Military-style fitness coaching powered by OpenAI
- **Firebase Authentication**: OAuth login with Google and Facebook
- **Progressive Web App**: Installable on mobile and desktop

## Technology Stack

- **Frontend**: React 18.2, TypeScript 5.1, Vite
- **Backend**: Netlify Functions, Firebase
- **AI**: OpenAI GPT-4
- **Authentication**: Firebase Auth
- **Hosting**: Netlify
- **Styling**: TailwindCSS

## Security

This application follows security best practices including:
- Environment variable configuration for sensitive data
- Content Security Policy headers
- Input validation and sanitization
- Cryptographically secure random number generation
- Environment-aware logging

See the [Security](./security/) documentation for details.

## Contributing

When contributing, please:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Run security checks before committing
5. Review the security audit before handling sensitive data

## License

This project is dedicated to the memory of Ofek Bechar and Shilo Har-Even.
