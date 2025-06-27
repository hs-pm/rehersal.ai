# AI Interview Practice Platform

A comprehensive interview practice application powered by AI that helps you prepare for interviews with AI-generated questions, multi-modal recording capabilities, and detailed performance analysis.

## 🚀 Features

### Core Functionalities
- **AI Question Generation**: Generate practice questions for any subject using Groq's LLM
- **Multi-modal Recording**: Record audio and video responses during practice sessions
- **Text Input**: Type responses for code snippets or detailed answers
- **Speech-to-Text**: Automatic transcription of audio responses
- **AI Evaluation**: Get detailed feedback and scoring on your responses
- **Timeline Analysis**: Track speaking patterns across 7 key metrics
- **Session Management**: Save and review all your practice sessions
- **Progress Tracking**: Monitor your improvement over time

### Technical Features
- **Real-time Recording**: Audio and video recording with browser APIs
- **AI-Powered Analysis**: Comprehensive evaluation using Groq's LLM
- **Responsive Design**: Modern UI that works on all devices
- **Data Visualization**: Charts and graphs for performance insights
- **Secure Storage**: All data stored securely in Vercel Postgres

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Groq API (Llama 3.1 8B model)
- **Database**: Vercel Postgres
- **File Storage**: Vercel Blob Storage
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key (free tier available)
- Vercel account
- Railway account (for database)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd interview-practice-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp env.example .env.local
```

Required environment variables:
```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration (Vercel Postgres)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_HOST=your_postgres_host
POSTGRES_DATABASE=your_database_name
POSTGRES_USERNAME=your_username
POSTGRES_PASSWORD=your_password

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Set Environment Variables**:
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add all the environment variables from your `.env.local`

4. **Deploy**: Vercel will automatically deploy your application

### Database Setup (Railway)

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Create PostgreSQL Database**:
   - Create a new project
   - Add PostgreSQL service
   - Copy the connection details

3. **Update Environment Variables**:
   - Add the PostgreSQL connection string to your Vercel environment variables

### Groq API Setup

1. **Sign Up**: Go to [console.groq.com](https://console.groq.com)
2. **Get API Key**: Create a new API key
3. **Add to Environment**: Add the API key to your Vercel environment variables

## 📊 Usage Guide

### Starting a Practice Session

1. **Navigate to Practice**: Click "Start Practice" on the homepage
2. **Choose Subject**: Enter the topic you want to practice (e.g., "React", "System Design")
3. **Generate Questions**: AI will create relevant questions for your subject
4. **Record Responses**: Use audio/video recording or type your responses
5. **Get Feedback**: Receive detailed AI evaluation after each response

### Reviewing Results

1. **View History**: Check your practice history page
2. **Analyze Performance**: Review detailed charts and metrics
3. **Track Progress**: Monitor improvements over time
4. **Replay Sessions**: Watch your recorded responses

## 🔧 API Endpoints

### Questions
- `POST /api/questions/generate` - Generate AI questions
- `GET /api/questions` - Get all questions

### Sessions
- `POST /api/sessions/create` - Create new practice session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/[id]/results` - Get session results

### Responses
- `POST /api/responses/evaluate` - Evaluate response with AI
- `GET /api/responses/[sessionId]` - Get session responses

## 📈 Performance Metrics

The application tracks 7 key performance indicators:

1. **Clarity**: How clear and understandable your responses are
2. **Confidence**: Your level of confidence in delivery
3. **Technical Depth**: Depth of technical knowledge demonstrated
4. **Communication**: Effectiveness of communication skills
5. **Structure**: Organization and structure of responses
6. **Engagement**: How engaging and interesting your responses are
7. **Completeness**: How complete and thorough your answers are

## 🔒 Security & Privacy

- All API keys are stored securely as environment variables
- Database connections use SSL encryption
- No sensitive data is logged or stored in plain text
- Audio/video files are stored securely in Vercel Blob Storage

## 🐛 Troubleshooting

### Common Issues

1. **Groq API Errors**: Check your API key and rate limits
2. **Database Connection**: Verify PostgreSQL connection string
3. **Recording Issues**: Ensure browser permissions for microphone/camera
4. **Build Errors**: Check Node.js version and dependencies

### Development Tips

- Use `npm run dev` for local development
- Check browser console for client-side errors
- Monitor Vercel function logs for API errors
- Use TypeScript for better development experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

## 🎯 Roadmap

- [ ] Real-time speech-to-text during recording
- [ ] Advanced video analysis (body language, facial expressions)
- [ ] Collaborative practice sessions
- [ ] Custom question templates
- [ ] Integration with calendar apps
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF
- [ ] Integration with job boards
- [ ] Mock interview scheduling

---

Built with ❤️ using Next.js, Groq AI, and Vercel 