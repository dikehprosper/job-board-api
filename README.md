# Job Board API

A RESTful API for a job board application, built with Node.js and Express. This API allows users to register, authenticate, and manage job postings. It integrates with AWS for storage and includes email notifications.

Live/Base API:
https://jobboardapi.tracebeta.com


## Features
- User registration and authentication (JWT)
- CRUD operations for job postings
- Input validation
- Error handling middleware
- AWS integration for file storage
- Email notifications

## Project Structure
```
job-board-api/
├── package.json
├── server.js
├── src/
│   ├── config/
│   │   └── aws.config.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Job.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── jobRoutes.js
│   ├── utils/
│   │   ├── mail.js
│   │   └── validateObjectId.js
│   └── validation/
│       ├── authValidation.js
│       └── jobValidation.js
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd job-board-api
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the root directory and add the required environment variables (see below).

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

**Note:** Never commit your `.env` file to version control.

### Running the Server
```bash
npm start
```
The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT

### Jobs
- `GET /api/jobs` — Get all jobs
- `POST /api/jobs` — Create a new job (authenticated)
- `GET /api/jobs/:id` — Get a job by ID
- `PUT /api/jobs/:id` — Update a job (authenticated)
- `DELETE /api/jobs/:id` — Delete a job (authenticated)

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)



