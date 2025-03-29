# AICodeCompanion 🤖

A domain-specific coding assistant powered by Google's Gemini AI, built to help developers write better code, debug issues, and understand programming concepts.

## 🌟 Features

- *Multi-Language Support*: Write, debug, and optimize code in Python, JavaScript, Java, C++, and more
- *Advanced Problem Solving*: Get step-by-step solutions with detailed explanations
- *Smart Code Generation*: Generate optimized, well-commented code following modern best practices
- *Powered by Google Gemini*: Leveraging Google's most advanced AI model for accurate assistance

## 🛠 Tech Stack

- *Frontend*: React, TypeScript, TailwindCSS, Shadcn/UI
- *Backend*: Express.js, TypeScript
- *Database*: PostgreSQL with Drizzle ORM
- *AI*: Google Generative AI (Gemini)

## 🚀 Getting Started

1. Clone the repository:
bash
git clone https://github.com/HarshMishra-Git/AICodeCompanion.git


2. Install dependencies:
bash
npm install


3. Set up environment variables:
- Create a .env file in the root directory
- Add your Gemini API key:

GEMINI_API_KEY=your_api_key_here


4. Start the development server:
bash
npm run dev


The application will be available at http://localhost:5000

## 🏗 Complete Project Structure


├── client/                      # Frontend React application
│   ├── src/
│   │   ├── pages/              # React pages components
│   │   │   └── LandingPage.tsx # Landing page component
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── main.tsx          # Main React entry point
│   └── index.html            # HTML template
├── server/                    # Express.js backend
│   ├── services/             # Service layer
│   │   └── geminiService.ts  # Gemini AI service
│   ├── routes/              # API routes
│   ├── index.ts            # Server entry point
│   ├── routes.ts          # Route definitions
│   ├── storage.ts        # Storage utilities
│   └── vite.ts          # Vite configuration
├── shared/              # Shared code between frontend and backend
│   └── schema.ts       # Database schema definitions
├── migrations/         # Database migrations
├── drizzle.config.ts  # Drizzle ORM configuration
├── package.json       # Project dependencies
├── tsconfig.json     # TypeScript configuration
└── tailwind.config.ts # Tailwind CSS configuration


## 🚀 Local Setup (Windows)

1. *Prerequisites*
   - Install [Node.js](https://nodejs.org/) (v20 or later)
   - Install [PostgreSQL](https://www.postgresql.org/download/windows/)
   - A code editor (VS Code recommended)

2. *Environment Setup*
   - Create a .env file in the root directory:
   env
   DATABASE_URL=postgresql://username:password@localhost:5432/aicodingassistant
   GEMINI_API_KEY=your_gemini_api_key
   

3. *Database Setup*
   bash
   # Create a new PostgreSQL database
   createdb aicodingassistant

   # Run database migrations
   npm run db:push
   

4. *Install Dependencies*
   bash
   # Install project dependencies
   npm install
   

5. *Start Development Server*
   bash
   # Run the development server
   npm run dev
   

   The application will be available at http://0.0.0.0:5000

## 📦 Available Scripts

- npm run dev - Start development server
- npm run build - Build for production
- npm run start - Start production server
- npm run check - Type-check TypeScript
- npm run db:push - Push database schema changes

## 💾 Database Schema

The project uses PostgreSQL with Drizzle ORM. Database schema can be found in shared/schema.ts.

## 🔒 Environment Variables

Required environment variables:
- DATABASE_URL: PostgreSQL connection string
- GEMINI_API_KEY: Google Gemini AI API key

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Generative AI for providing the Gemini model
- Shadcn/UI for the beautiful component library
- The open-source community for inspiration and tools

## 📬 Contact

- GitHub: [@HarshMishra-Git](https://github.com/HarshMishra-Git)

---
