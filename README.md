# Ink-well Server

## Project Overview
`Ink-well-server` is the server-side component of the collaborative writing web application, Ink-well. This project is designed to handle user authentication, comment notifications, and other server-side functionalities for the collaborative writing platform. The project is still in development and will have additional features added over time.

## Features

- **User Authentication**: Allows users to log in and manage their accounts.
- **Comment Notifications**: Notifies users about comments on their writings.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Uploads**: Multer
- **Image Storage**: Cloudinary
- **Pagination**: Mongoose Aggregate Paginate
- **Middleware**: cookie-parser, cors
- **Environment Variables**: dotenv

## Setup Instructions

To set up and run the `Ink-well-server` project locally, follow these steps:

1. **Clone the Repository**
   ```sh
   git clone https://github.com/Rahul-aithal/Ink-well-server.git
   cd Ink-well-server

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Run the Server**
   ```sh
   npm run dev
   ```

   This will start the server with `nodemon`, which watches for changes in your files and restarts the server automatically.

## Contact

For any questions or support, you can reach out to me on Discord: **rahulaithal**.

---

*Note: The project is still under development. Additional features and improvements will be made in future updates.*

