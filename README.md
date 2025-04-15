# ConnectHub Social Media App

![mediamodifier_image(1)](https://github.com/user-attachments/assets/cd1b135b-9ae4-41fd-b639-69d0e4933961)


This is a social media application built using the MERN stack (MongoDB, Express, React, Node.js). The frontend is developed with React and styled using Tailwind CSS. The application allows users to register, log in, create posts, and view profiles.

## Project Structure

The project is divided into two main directories: `client` and `server`.

### Client

The `client` directory contains the React application.

- **public/**: Contains static files.
  - `index.html`: The main HTML file for the React application.
  - `favicon.ico`: The favicon for the application.

- **src/**: Contains the source code for the React application.
  - **components/**: Contains reusable components.
    - **Auth/**: Components for authentication.
      - `Login.jsx`: Component for user login.
      - `Register.jsx`: Component for user registration.
    - **Feed/**: Components for displaying posts.
      - `Post.jsx`: Component representing a single post.
      - `PostList.jsx`: Component displaying a list of posts.
    - **Profile/**: Component for user profiles.
      - `UserProfile.jsx`: Component displaying user profile information.
    - **Layout/**: Layout components.
      - `Navbar.jsx`: Navigation bar component.
      - `Footer.jsx`: Footer component.
    - **common/**: Common reusable components.
      - `Button.jsx`: Reusable button component.
      - `Modal.jsx`: Reusable modal dialog component.
  - **pages/**: Contains page components.
    - `Home.jsx`: Home page component.
    - `Profile.jsx`: Profile page component.
    - `Login.jsx`: Login page component.
    - `Register.jsx`: Registration page component.
  - **context/**: Contains context providers.
    - `AuthContext.jsx`: Context provider for authentication state.
  - **utils/**: Utility functions.
    - `api.js`: Functions for making API calls to the backend.
  - `App.jsx`: Main application component.
  - `index.jsx`: Entry point of the React application.

- `tailwind.config.js`: Configuration file for Tailwind CSS.
- `package.json`: Configuration file for npm in the client directory.

### Server

The `server` directory contains the backend application.

- **config/**: Configuration files.
  - `db.js`: Database connection configuration.
- **controllers/**: Contains request handlers.
  - `authController.js`: Handles authentication-related requests.
  - `userController.js`: Handles user-related requests.
  - `postController.js`: Handles post-related requests.
- **models/**: Contains Mongoose models.
  - `User.js`: User schema model.
  - `Post.js`: Post schema model.
- **routes/**: Contains route definitions.
  - `auth.js`: Routes related to authentication.
  - `users.js`: Routes related to user operations.
  - `posts.js`: Routes related to post operations.
- **middleware/**: Contains middleware functions.
  - `auth.js`: Middleware for protecting routes.
- `server.js`: Entry point of the server application.
- `package.json`: Configuration file for npm in the server directory.
- `.env`: Environment variables for the server.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd social-media-app
   ```

2. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```
   cd server
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   node server.js
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

The application should now be running on `http://localhost:3000`.

## Contributing

Feel free to submit issues or pull requests for any improvements or features you would like to see!

## License

This project is licensed under the MIT License.
=======
# ConnectHub-Social-Media-App
>>>>>>> 998fcd95a675f547d2fed1418faba10adeda5c4f
