require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const models = require('./models');

const app = express();

// Only apply CORS in development environment
// In production, we'll use Vercel's CORS configuration
if (process.env.NODE_ENV !== 'production') {
  const corsOptions = {
    origin: [
      'https://splitzy-frontend-kannan-m-kannan-m-projects.vercel.app',
      'https://splitzy-frontend.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
  // Handle OPTIONS preflight requests for all routes
  app.options('*', cors(corsOptions));
}

app.use(express.json());

// Database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/expense_sharing', {
  dialect: 'postgres',
  logging: false
});

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => console.error('Unable to connect to the database:', err));

// Import and use routes
const routes = require('./routes');
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Expense Sharing API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});