const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for social auth users
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'email',
      validate: {
        isIn: [['email', 'google', 'facebook', 'github']]
      }
    },
    providerId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prefs: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    currentLanguage: {
      type: DataTypes.STRING(10),
      defaultValue: 'hi',
      field: 'current_language'
    },
    targetLanguage: {
      type: DataTypes.STRING(10),
      defaultValue: 'te',
      field: 'target_language'
    },
    level: {
      type: DataTypes.STRING(20),
      defaultValue: 'beginner',
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced']]
      }
    },
    hearts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 0,
        max: 10
      }
    },
    maxHearts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'max_hearts',
      validate: {
        min: 1,
        max: 10
      }
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    lastActivity: {
      type: DataTypes.DATE,
      field: 'last_activity'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_admin'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.updateActivity = async function() {
    this.lastActivity = new Date();
    await this.save();
  };

  User.prototype.useHeart = async function() {
    if (this.hearts > 0) {
      this.hearts -= 1;
      await this.save();
      return true;
    }
    return false;
  };

  User.prototype.addHeart = async function() {
    if (this.hearts < this.maxHearts) {
      this.hearts += 1;
      await this.save();
      return true;
    }
    return false;
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};