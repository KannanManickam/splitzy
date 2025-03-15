const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

let sequelize;
try {
  sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/expense_sharing', {
    dialect: 'postgres',
    logging: false
  });

  // Test the connection
  sequelize.authenticate()
    .then(() => console.log('Database connection has been established successfully.'))
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      process.exit(1);
    });
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}

const models = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    models[model.name] = model;
  });

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add Sequelize Op to models for queries
models.Sequelize = Sequelize;
models.sequelize = sequelize;

module.exports = models;