const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize({
  database: config.get('DB_NAME'),
  username: config.get('DB_USER'),
  password: config.get('DB_PASSWORD'),
  host: config.get('DB_HOST'),
  port: config.get('DB_PORT'),
  dialect: 'postgres',
  logging: config.isDevelopment() ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Exercise = require('./exercise')(sequelize, Sequelize.DataTypes);
const UserProgress = require('./userProgress')(sequelize, Sequelize.DataTypes);
const APIUsage = require('./apiUsage')(sequelize, Sequelize.DataTypes);
const Translation = require('./translation')(sequelize, Sequelize.DataTypes);
const Transliteration = require('./transliteration')(sequelize, Sequelize.DataTypes);
const TTSEntry = require('./ttsEntry')(sequelize, Sequelize.DataTypes);
const RLState = require('./rlState')(sequelize, Sequelize.DataTypes);

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });
  User.hasMany(APIUsage, { foreignKey: 'userId', as: 'apiUsage' });
  User.hasOne(RLState, { foreignKey: 'userId', as: 'rlState' });

  // Exercise associations
  Exercise.hasMany(UserProgress, { foreignKey: 'exerciseId', as: 'userProgress' });
  Exercise.hasMany(Translation, { foreignKey: 'exerciseId', as: 'translations' });
  Exercise.hasMany(Transliteration, { foreignKey: 'exerciseId', as: 'transliterations' });
  Exercise.hasMany(TTSEntry, { foreignKey: 'exerciseId', as: 'ttsEntries' });

  // UserProgress associations
  UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  UserProgress.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

  // Translation associations
  Translation.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

  // Transliteration associations
  Transliteration.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

  // TTSEntry associations
  TTSEntry.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

  // APIUsage associations
  APIUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // RLState associations
  RLState.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

setupAssociations();

module.exports = {
  sequelize,
  User,
  Exercise,
  UserProgress,
  APIUsage,
  Translation,
  Transliteration,
  TTSEntry,
  RLState
};