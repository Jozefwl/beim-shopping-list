# Beim Shopping List

BackEnd-IMplementation shopping list

## Description

Beim Shopping List is a backend application for managing shopping lists. This application allows users to create, update, and manage their shopping lists with ease.

## Features

- Create and manage shopping lists.
- User authentication and authorization.
- Secure password handling with bcrypt.
- Token-based user session management with JSON Web Tokens.

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- Joi for data validation
- Bcrypt for password hashing

## Installation

To set up this project locally, follow these steps:

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/your-github-username/beim-shopping-list.git
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the server:**

    - First time usage, without unpopulated database:
    ```bash
    npm run populateAndStart
    ```

    - Development (nodemon), after population:
    ```bash
    npm run devStart
    ```

4. **Usage:**

    - Use included insomnia collection

5. **API Endpoints:**

    GET /
        Welcome message and server status.

### Authentication

- **POST /login**
  - Authenticates a user and returns a JWT token.
- **POST /register**
  - Registers a new user.

### Shopping Lists

- **GET /getAllLists**
  - Retrieves all shopping lists (Admin only).
- **GET /getList/:listId**
  - Retrieves a specific shopping list by its ID. Accessible to the owner, shared users, and admins.
- **POST /createList**
  - Creates a new shopping list. Accessible to authenticated users.
- **PUT /updateList/:listId**
  - Updates a specific shopping list by its ID. Accessible to the owner and shared users.
- **DELETE /deleteList/:listId**
  - Deletes a specific shopping list by its ID. Accessible to the owner.
- **GET /getAllPublicLists**
  - Retrieves all public shopping lists.

### Permissions

- **GET /getSharePermissions/:listId**
  - Retrieves sharing permissions of a specific list.
