# Expense Sharing Application

An open-source expense-sharing application similar to Splitwise that helps users manage and split expenses within groups.

## Features

### Implemented Features ✅

#### User Management
- User registration and login
- Profile management
- Friend/contact management with request system

#### Group Management
- Create and manage groups
- Add/remove members
- Group categories (Home, Trip, Other)

#### Expense Management
- Add/edit expenses with date picker
- Split expenses equally between friends
- Track expense history

#### Debt Calculation
- Friend-level balance calculation
- Detailed transaction history between friends
- Payment suggestions for settling debts
- Visual indicators for balances (who owes whom)

### Coming Soon 🚀

#### Group Expense Integration
- Adding expenses to specific groups
- Splitting expenses among group members
- Group-level balance calculations

#### Settlement Feature
- Record payments between users
- Settlement history
- Mark debts as settled

#### Advanced Expense Features
- Expense categories and tagging
- Recurring expenses
- Receipt image upload

#### Activity and Notifications
- Activity feed with recent actions
- Email notifications
- In-app notifications

## Tech Stack

### Frontend
- React with TypeScript
- Material UI components
- React Router for navigation
- Context API for state management
- Axios for API requests

### Backend
- Node.js with Express
- RESTful API architecture
- JWT authentication
- Sequelize ORM

### Database
- PostgreSQL

### Security
- Authentication with JWT
- Password encryption
- Input validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL

### Installation

#### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables (create a `.env` file with required configuration)
4. Start the development server: `npm run dev`

#### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at `http://localhost:5173`

## Development

The project follows a feature-based development approach. Current focus areas:
1. Group expense integration
2. Settlement tracking system
3. Advanced filtering and expense categorization

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Submit a pull request

## License

MIT