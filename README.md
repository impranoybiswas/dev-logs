# Dev Logs 🚀

A premium workspace for modern developers to track job applications, document their journey, and showcase their professional edge.

## ✨ Feature Showcase

# Live Demo : [https://dev-logs-pranoy.vercel.app/](https://dev-logs-pranoy.vercel.app/)

# Test User

email : test@email.com
password : pass123

### 📊 Developer Dashboard

- **Application Tracking**: Real-time status updates for job applications (Pending, Interviewing, Accepted, Rejected).
- **Activity Visualization**: Beautiful Recharts-powered analytics for your career progress.
- **Social Integration**: One-click access to all your professional profiles.

### 📝 AI-Powered Resume Builder (Beta)

- **Modern Templates**: Elegant, professional designs optimized for ATS.
- **Instant Export**: Download your resume as a high-quality PDF.
- **Dynamic Content**: Easy sections for education, experience, and skills.

### 💬 Real-time Networking

- **Direct Messaging**: Connect with other developers via Socket.io-powered chat.
- **Friend System**: Build your network with seamless friend requests and notifications.
- **Global Search**: Find and connect with developers worldwide.

### 🎨 Premium UI/UX

- **Dynamic Themes**: Seamless switching between stunning Light and Dark modes.
- **Modern Aesthetics**: Built with Ant Design, Tailwind CSS, and Framer Motion for a fluid, glass morphic feel.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Ant Design](https://ant.design/), [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [React Query](https://tanstack.com/query/latest)
- **Real-time**: [Socket.io Client](https://socket.io/)

### Backend

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [JWT](https://jwt.io/) & [Passport](https://www.passportjs.org/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Uploads**: [ImageKit.io](https://imagekit.io/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- ImageKit.io Account (Optional for uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/impranoybiswas/dev-logs.git
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Configure .env with DATABASE_URL and ImageKit keys
   npx prisma migrate dev
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Configure .env.local with NEXT_PUBLIC_API_URL
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.
