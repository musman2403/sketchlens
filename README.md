# SketchLens

Turn any image into a step-by-step drawing lesson using OpenCV and Gemini AI.

## Features
- **AI-Powered Instructions**: Uses Google Gemini 1.5 Pro to generate natural language instructions based on your image.
- **Client-Side Edge Detection**: Processes images efficiently in your browser using OpenCV.
- **Progressive Overlays**: Traces proportions first, then form, then details.
- **Premium UI**: Fluid glassmorphism interface with Framer Motion transitions.
- **Internationalization**: Fully supports English, Spanish, and Arabic (RTL).
- **PWA Support**: Installable as a Progressive Web App for an app-like experience.
- **Monetization**: Built-in Stripe checkout for the SketchLens Pro tier.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (or local MongoDB)
- Google Gemini API Key

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/musman2403/sketchlens.git
   cd sketchlens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` in the root:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

   Create a `.env` in the `server` directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Run the Backend Server:
   ```bash
   node server/index.js
   ```

5. Run the Frontend:
   ```bash
   npm run dev
   ```

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS (via generic utility classes), Framer Motion
- Backend: Node.js, Express, MongoDB (Mongoose)
- AI: Google Gemini API (`@google/genai`)
- Computer Vision: OpenCV.js
- Payments: Stripe

## License
MIT
