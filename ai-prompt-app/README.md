# AI Prompt Application

A simple full-stack application with React TypeScript frontend and Node.js Express backend for AI prompt interactions.

## Tech Stack

### Frontend
- React with TypeScript
- Ant Design UI components
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Project Structure

```
ai-prompt-app/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx    # Main application component
│   │   └── App.css    # Application styles
│   └── package.json
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── server.ts           # Express server setup
│   │   ├── routes/            
│   │   │   └── promptRoutes.ts # API routes
│   │   ├── controllers/       
│   │   │   └── promptController.ts # Request handlers
│   │   └── services/          
│   │       └── aiService.ts   # AI service integration
│   ├── .env           # Environment variables
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/prompt` - Send a prompt and receive AI response
- `GET /api/history` - Get conversation history
- `DELETE /api/history` - Clear conversation history
- `GET /health` - Health check endpoint

## Customization

The AI service in `backend/src/services/aiService.ts` is a placeholder. You can integrate your preferred AI provider by modifying the `generateResponse` function.

## Development

Both frontend and backend support hot-reloading during development. Make changes to the code and see them reflected immediately.
