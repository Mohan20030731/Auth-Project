# Auth-Project

A robust Node.js authentication API with email verification, password management, and post management features built with Express.js and MongoDB.

## Features

### Authentication

- **User Registration** - Sign up with email and password
- **User Login** - Secure JWT-based authentication
- **Email Verification** - Email verification with time-limited codes
- **Password Management** - Change password and forgot password functionality
- **Secure Logout** - Clear authentication cookies

### Post Management

- **Create Posts** - Authenticated users can create posts
- **View Posts** - Paginated post listing with user information
- **Update Posts** - Edit your own posts
- **Delete Posts** - Remove your own posts
- **Single Post View** - View individual post details

### Security Features

- Password hashing with bcrypt
- JWT token authentication
- HMAC verification codes
- Input validation with Joi
- Security headers with Helmet
- CORS protection
- HTTP-only cookies for production

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd auth-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/auth-project
   TOKEN_SECRET=your-jwt-secret-key
   HMAC_VERIFICATION_CODE_SECRET=your-hmac-secret
   NODE_CODE_SENDING_EMAIL_ADDRESS=your-email@gmail.com
   NODE_ENV=development

   # Email configuration (for Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint                       | Description                  | Auth Required |
| ------ | ------------------------------ | ---------------------------- | ------------- |
| POST   | `/signup`                      | Register new user            | No            |
| POST   | `/signin`                      | User login                   | No            |
| POST   | `/signout`                     | User logout                  | Yes           |
| PATCH  | `/send-verification-code`      | Send email verification code | Yes           |
| PATCH  | `/verify-verification-code`    | Verify email with code       | Yes           |
| PATCH  | `/change-password`             | Change user password         | Yes           |
| PATCH  | `/send-forgot-password-code`   | Send forgot password code    | No            |
| PATCH  | `/verify-forgot-password-code` | Reset password with code     | No            |

### Post Routes (`/api/posts`)

| Method | Endpoint  | Description           | Auth Required |
| ------ | --------- | --------------------- | ------------- |
| GET    | `/`       | Get paginated posts   | No            |
| POST   | `/`       | Create new post       | Yes           |
| GET    | `/single` | Get single post by ID | No            |
| PUT    | `/`       | Update post           | Yes           |
| DELETE | `/`       | Delete post           | Yes           |

## Request Examples

### User Registration

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### User Login

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Create Post

```bash
POST /api/posts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My First Post",
  "description": "This is the content of my post."
}
```

### Get Posts (with pagination)

```bash
GET /api/posts?page=1
```

## Project Structure

```
auth-project/
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── postsController.js   # Post management logic
├── middlewares/
│   ├── identification.js   # JWT authentication middleware
│   ├── sendMail.js         # Email service configuration
│   └── validator.js        # Input validation schemas
├── models/
│   ├── usersModel.js       # User database schema
│   └── postsModel.js       # Post database schema
├── routers/
│   ├── authRouter.js       # Authentication routes
│   └── postsRouter.js      # Post management routes
├── utils/
│   └── hashing.js          # Password hashing utilities
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── index.js               # Application entry point
└── package.json           # Project dependencies
```

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 8 hours
- Verification codes expire after 5 minutes
- Email verification required for certain operations
- Input validation on all endpoints
- CORS and security headers configured
- Sensitive data excluded from API responses

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (not implemented)

### Code Validation

The project uses Joi for input validation with schemas for:

- User signup/signin
- Email verification codes
- Password changes
- Post creation/updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
