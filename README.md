# Ventrix Technologies – Backend API

A RESTful backend application developed as part of the Ventrix Technologies Full Stack Developer Intern technical assessment.

The backend powers the Ventrix Technologies company website and admin portal. It handles job applications, business enquiries, admin authentication, database operations, and AI-powered functionality.

## ✨ Features

### 1. Admin Authentication
- Admin authentication through backend APIs.
- JWT-based authentication configuration.
- Protected admin routes.
- Environment-based credential configuration.

### 2. Job Application Management
- Receive job applications from the company website.
- Process applicant information.
- Handle resume uploads.
- Store application data in MongoDB.
- Provide application data to the admin portal.

### 3. Business Enquiry Management
- Receive contact form submissions.
- Process customer information and enquiry messages.
- Store enquiries in MongoDB.
- Provide enquiry data to the admin portal.

### 4. AI Integration

#### AI Website Chatbot
- Backend API integration for the Ventrix AI chatbot.
- Processes chatbot requests.
- Provides company-related information about services and products.
- Supports conversational interactions.

#### AI-Assisted Lead Enquiry Classification
- Analyses incoming business enquiries.
- Determines enquiry priority based on content and intent.
- Helps administrators identify high-priority enquiries.
- Supports enquiry management and follow-up.

### 5. REST API Architecture
- Modular route organization.
- Separate route files for different application modules.
- Centralized error handling.
- JSON request and response handling.

### 6. Security and Middleware
- Helmet for HTTP security headers.
- CORS configuration with allowed frontend origins.
- Environment variable validation.
- Express request payload size limits.
- Centralized error handling.
- Sensitive credentials maintained through environment variables.

### 7. Database Integration
- MongoDB integration using Mongoose.
- Database connection management.
- Persistent storage for applications and enquiries.

### 8. Server Management
- Environment-based configuration.
- Production and development environments.
- HTTP server error handling.
- Graceful shutdown handling.
- Request logging using Morgan.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Programming Language | JavaScript (ES6+) |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Security | Helmet, CORS |
| Request Logging | Morgan |
| API Architecture | REST APIs |
| Version Control | Git & GitHub |
| Deployment | Render |

## 🏗️ Project Architecture

The backend follows a modular architecture with separate routes, controllers, models, and configuration files.

### Main Backend Modules

| Module | Responsibility |
|---|---|
| Admin Authentication | Admin login and authentication |
| Admin | Administrative operations |
| Admin Applications | Job application management |
| Admin Enquiries | Business enquiry management |
| Applications | Public job application submissions |
| Contact | Business enquiry submissions |
| Chat | AI chatbot communication |

## 📁 Project Structure

```text
backend/
│
├── config/
│   └── db.js
│
├── controllers/
│
├── models/
│
├── routes/
│   ├── contactRoutes.js
│   ├── applicationRoutes.js
│   ├── chatRoutes.js
│   ├── adminAuthRoutes.js
│   ├── adminRoutes.js
│   ├── adminApplicationRoutes.js
│   └── adminEnquiryRoutes.js
│
├── middleware/
│
├── server.js
├── package.json
├── package-lock.json
└── .env
```

*The structure above illustrates the main modules. Add or adjust folders to match the actual repository.*

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB
- Git

### 1. Clone the repository

```bash
git clone YOUR_BACKEND_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

ADMIN_EMAIL=your_admin_email

ADMIN_PASSWORD_HASH=your_hashed_admin_password

CLIENT_URL=http://localhost:5173

ADMIN_URL=http://localhost:5174
```

**Environment variable descriptions:**

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for JWT authentication |
| `ADMIN_EMAIL` | Configured admin email |
| `ADMIN_PASSWORD_HASH` | Hashed admin password |
| `CLIENT_URL` | Public frontend origin |
| `ADMIN_URL` | Admin frontend origin |

Never commit the `.env` file or expose credentials in public repositories.

### 5. Start the development server

```bash
npm run dev
```

If a development script is not configured, start the server using:

```bash
node server.js
```

### 6. Start the production server

```bash
npm start
```

The backend will start on the configured port.

For local development, the default port is:

```text
http://localhost:5000
```

## 🔗 API Routes

The backend organizes its APIs into the following route groups:

| Route Prefix | Module |
|---|---|
| `/api/admin/auth` | Admin authentication |
| `/api/admin/applications` | Admin application management |
| `/api/admin/enquiries` | Admin enquiry management |
| `/api/admin` | Admin operations |
| `/api/contact` | Contact enquiries |
| `/api/applications` | Job applications |
| `/api/chat` | AI chatbot |

The root endpoint provides a health check:

```http
GET /
```

Example response:

```json
{
  "success": true,
  "message": "Ventrix Technologies API is running",
  "environment": "production"
}
```

## 🌍 CORS Configuration

The backend uses the CORS middleware to control which frontend applications can communicate with the API.

Allowed production origins are configured using:

- `CLIENT_URL`
- `ADMIN_URL`

During development, the backend also allows:

- `http://localhost:5173`
- `http://localhost:5174`

Requests from unauthorized origins are rejected.

## 🔐 Security

The backend implements the following security measures:

- Helmet for HTTP security headers.
- Restricted CORS origins.
- JWT authentication configuration.
- Environment variable validation.
- Request payload size limits.
- Centralized error handling.
- Secure separation of frontend and backend credentials.

## 🚀 Deployment

The backend is deployed using **Render**.

Deployment workflow:

1. Push backend source code to GitHub.
2. Create a Web Service on Render.
3. Connect the backend GitHub repository.
4. Configure the build and start commands.
5. Add the required environment variables.
6. Deploy the backend service.
7. Configure the frontend API URL and production CORS origins.

### Deployment Commands

**Build Command:**

```bash
npm install
```

**Start Command:**

```bash
npm start
```

## 🧪 Testing

The following backend functionality has been tested:

- MongoDB connection.
- Backend server startup.
- Admin authentication.
- Job application submission.
- Business enquiry submission.
- Resume upload and download integration.
- Admin application and enquiry retrieval.
- AI chatbot interactions.
- AI enquiry priority classification.
- Frontend and backend communication.
- Production CORS configuration.

## 📌 Future Improvements

- Automated backend testing.
- API documentation using Swagger.
- Enhanced API rate limiting.
- Advanced enquiry analytics.
- More detailed application and enquiry reporting.

---

**Backend API developed as part of the Ventrix Technologies technical assessment.**
