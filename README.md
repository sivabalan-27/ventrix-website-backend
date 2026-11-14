# Ventrix Technologies – Backend API

A RESTful backend application developed as part of the Ventrix Technologies Full Stack Developer Intern technical assessment.

The backend powers the Ventrix Technologies company website and admin portal. It handles job applications, business enquiries, admin authentication, database operations, and AI-powered functionality.

## ✨ Features

### 1. Admin Authentication

- Admin authentication through backend APIs.
- JWT-based authentication.
- Protected admin routes.
- Environment-based admin credential configuration.
- Password hash-based authentication.

### 2. Job Application Management

- Receive job applications from the company website.
- Process applicant information.
- Handle resume uploads.
- Store application data in MongoDB.
- Provide application data to the admin portal.
- Support application retrieval and resume downloads.

### 3. Business Enquiry Management

- Receive contact form submissions.
- Process customer information and enquiry messages.
- Store enquiries in MongoDB.
- Provide enquiry data to the admin portal.
- Support AI-assisted enquiry priority classification.

### 4. AI Integration

The backend integrates the Google Gemini API to support two AI-powered features.

#### AI Website Chatbot

- Processes chatbot requests from the website.
- Provides company-related information about Ventrix Technologies.
- Responds to questions about services and products.
- Supports conversational interactions.

#### AI-Assisted Enquiry Priority Classification

- Analyses incoming business enquiries.
- Determines enquiry priority based on content and intent.
- Helps administrators identify high-priority enquiries.
- Supports enquiry management and follow-up.

### 5. REST API Architecture

- Modular route organization.
- Separate route files for different application modules.
- JSON request and response handling.
- Centralized error handling.
- Organized backend modules.

### 6. Security and Middleware

- Helmet for HTTP security headers.
- CORS configuration with allowed frontend origins.
- Environment variable validation.
- Express request payload size limits.
- JWT-based authentication.
- Rate-limiting support.
- Sensitive credentials maintained through environment variables.

### 7. Database Integration

- MongoDB integration using Mongoose.
- Database connection management.
- Persistent storage for job applications and business enquiries.

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
| Authentication | JSON Web Token (JWT), bcrypt |
| AI Integration | Google Gemini API |
| Security | Helmet, CORS, Express Rate Limit |
| File Uploads | Multer |
| Request Logging | Morgan |
| Environment Configuration | dotenv |
| API Architecture | REST APIs |
| Version Control | Git & GitHub |
| Deployment | Render |

## 🏗️ Project Architecture

The backend follows a modular architecture with separate routes, controllers, models, services, middleware, and configuration files.

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
| Services | Backend service-level operations |
| Models | MongoDB data models |
| Configuration | Database configuration |

## 📁 Project Structure

```text
ventrix-website-backend/
│
├── config/
│   └── db.js
│
├── controllers/
│
├── middleware/
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
├── scripts/
│
├── services/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sivabalan-27/ventrix-website-backend.git
```

### 2. Navigate to the Project Directory

```bash
cd ventrix-website-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

You can use `.env.example` as a reference for the required configuration.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Frontend URLs
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Admin authentication
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
JWT_SECRET=your_secure_jwt_secret

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variable Descriptions

| Variable | Description |
|---|---|
| `PORT` | Port on which the backend server runs |
| `NODE_ENV` | Application environment, such as development or production |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Public frontend application origin |
| `ADMIN_URL` | Admin dashboard origin |
| `ADMIN_EMAIL` | Configured administrator email |
| `ADMIN_PASSWORD_HASH` | Bcrypt-hashed administrator password |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `GEMINI_API_KEY` | API key used to access Google Gemini AI services |

**Important:** Keep the actual `.env` file private. Never commit API keys, database credentials, password hashes, or JWT secrets to a public repository.

### 5. Start the Development Server

```bash
npm run dev
```

The development server runs using Nodemon.

### 6. Start the Production Server

```bash
npm start
```

The backend starts on the configured port.

For local development, the default API address is:

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
| `/api/contact` | Business enquiry submissions |
| `/api/applications` | Job application submissions |
| `/api/chat` | AI chatbot |

### Health Check

The root endpoint provides a basic server health check.

**Endpoint:**

```http
GET /
```

**Example Response:**

```json
{
  "success": true,
  "message": "Ventrix Technologies API is running",
  "environment": "production"
}
```

## 🤖 AI Integration

The backend uses the Google Gemini API for the website chatbot and AI-assisted business enquiry priority classification.

### Chatbot Workflow

1. The visitor sends a message through the website chatbot.
2. The frontend sends the request to the backend.
3. The backend communicates with the Gemini API.
4. Gemini generates a response.
5. The backend returns the response to the chatbot interface.

### Enquiry Priority Classification Workflow

1. A visitor submits a business enquiry.
2. The backend receives the enquiry details.
3. The enquiry content is processed using the Gemini API.
4. Gemini determines the enquiry priority.
5. The classification is made available to the admin workflow.

The Gemini API key is configured on the backend using the `GEMINI_API_KEY` environment variable.

## 🌍 CORS Configuration

The backend uses CORS middleware to control which frontend applications can communicate with the API.

Allowed production origins are configured using:

- `CLIENT_URL`
- `ADMIN_URL`

During local development, the backend also allows:

- `http://localhost:5173`
- `http://localhost:5174`

Requests from unauthorized origins are rejected.

## 🔐 Security

The backend includes the following security-related implementations:

- Helmet for HTTP security headers.
- Restricted CORS origins.
- JWT-based authentication.
- Bcrypt password hashing.
- Environment variable validation.
- Request payload size limits.
- Rate-limiting support.
- Centralized error handling.
- Server-side API credential configuration.

## 🚀 Deployment

The backend is deployed using Render.

### Deployment Workflow

1. Push the backend source code to GitHub.
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
- AI-assisted enquiry priority classification.
- Frontend and backend communication.
- Production CORS configuration.

## 📌 Future Improvements

- Automated backend testing.
- API documentation using Swagger.
- Enhanced API rate limiting.
- Advanced enquiry analytics.
- More detailed application and enquiry reporting.
- Improved AI response monitoring and error handling.

---

**Repository:** [Ventrix Website Backend](https://github.com/sivabalan-27/ventrix-website-backend)

**Backend API developed as part of the Ventrix Technologies technical assessment.**
