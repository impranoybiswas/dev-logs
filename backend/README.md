# Dev Logs - Backend 🛡️

The robust server-side core of the Dev Logs platform, built for scalability, security, and real-time performance.

# Server Link [https://dev-logs-server.vercel.app/](https://dev-logs-server.vercel.app/) 

## 🚀 Key Features

- **Architectural Excellence**: Built with NestJS using a modular structure for maintainability.
- **Real-time Engine**: Socket.io integration for instant messaging and live notifications.
- **Relational Data**: Powered by PostgreSQL with Prisma ORM for type-safe database operations.
- **Secure Auth**: JWT-based authentication with Passport strategies.
- **Media Management**: Secure image storage and optimization via ImageKit.io.

---

## 🛠️ Technical Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database Layer**: [Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)
- **Real-time**: [Socket.io](https://socket.io/) (WebSockets)
- **Security**: [Passport.js](https://www.passportjs.org/), [JWT](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Validation**: [Class-validator](https://github.com/typestack/class-validator) & [Class-transformer](https://github.com/typestack/class-transformer)
- **File Processing**: [ImageKit.io SDK](https://imagekit.io/)

---

## 📂 Module Breakdown

- **Auth**: Multi-strategy authentication and registration.
- **Users**: Profile management, search, and professional details.
- **Friendships**: Complex request/response flow for building networks.
- **Chat**: Persistent real-time messaging with historical data recovery.
- **Notifications**: System and user-triggered event broadcasting.
- **Job Applications**: CRUD operations for managing career leads.
- **Resume**: Data persistence for the dynamic resume builder.

---

## 🛠️ Development

### Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on the implementation requirements:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dev_logs"
   JWT_SECRET="your-super-secret"
   IMAGEKIT_PUBLIC_KEY="public_..."
   IMAGEKIT_PRIVATE_KEY="private_..."
   IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/..."
   ```

3. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Execution

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

### Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```

---

## 📄 License

MIT
