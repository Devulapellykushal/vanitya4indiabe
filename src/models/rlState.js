module.exports = (sequelize, DataTypes) => {
  const RLState = sequelize.define('RLState', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    algorithm: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'epsilon-greedy',
      validate: {
        isIn: [['epsilon-greedy', 'ucb1', 'thompson-sampling']]
      }
    },
    epsilon: {
      type: DataTypes.FLOAT,
      defaultValue: 0.1,
      validate: {
        min: 0,
        max: 1
      }
    },
    armWeights: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'arm_weights',
      comment: 'Weights for different exercise types/difficulties'
    },
    armCounts: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'arm_counts',
      comment: 'Number of times each arm has been pulled'
    },
    rewards: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Accumulated rewards for each arm'
    },
    totalPulls: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_pulls',
      validate: {
        min: 0
      }
    },
    lastReward: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'last_reward'
    },
    lastAction: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'last_action'
    },
    explorationRate: {
      type: DataTypes.FLOAT,
      defaultValue: 0.5,
      field: 'exploration_rate',
      validate: {
        min: 0,
        max: 1
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'rl_states',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['algorithm']
      }
    ]
  });

  // Instance methods
  RLState.prototype.updateArm = async function(arm, reward) {
    // Update arm counts
    this.armCounts = {
      ...this.armCounts,
      [arm]: (this.armCounts[arm] || 0) + 1
    };

    // Update rewards
    this.rewards = {
      ...this.rewards,
      [arm]: (this.rewards[arm] || 0) + reward
    };

    // Update weights based on algorithm
    if (this.algorithm === 'epsilon-greedy') {
      const count = this.armCounts[arm];
      const totalReward = this.rewards[arm];
      this.armWeights = {
        ...this.armWeights,
        [arm]: totalReward / count
      };
    }

    this.totalPulls += 1;
    this.lastReward = reward;
    this.lastAction = arm;

    await this.save();
  };

  RLState.prototype.selectArm = function() {
    const arms = Object.keys(this.armWeights);
    
    if (arms.length === 0) {
      return null;
    }

    // Exploration vs Exploitation
    if (Math.random() < this.epsilon) {
      // Explore: random selection
      return arms[Math.floor(Math.random() * arms.length)];
    } else {
      // Exploit: select best arm
      let bestArm = arms[0];
      let bestValue = this.armWeights[bestArm] || 0;

      for (const arm of arms) {
        const value = this.armWeights[arm] || 0;
        if (value > bestValue) {
          bestValue = value;
          bestArm = arm;
        }
      }

      return bestArm;
    }
  };

  RLState.prototype.initializeArms = async function(arms) {
    const weights = {};
    const counts = {};
    const rewards = {};

    for (const arm of arms) {
      weights[arm] = 0;
      counts[arm] = 0;
      rewards[arm] = 0;
    }

    this.armWeights = weights;
    this.armCounts = counts;
    this.rewards = rewards;

    await this.save();
  };

  RLState.prototype.getArmStats = function() {
    const arms = Object.keys(this.armWeights);
    return arms.map(arm => ({
      arm,
      weight: this.armWeights[arm] || 0,
      count: this.armCounts[arm] || 0,
      totalReward: this.rewards[arm] || 0,
      avgReward: this.armCounts[arm] ? (this.rewards[arm] / this.armCounts[arm]) : 0
    }));
  };

  // Class methods
  RLState.initializeForUser = async function(userId, algorithm = 'epsilon-greedy') {
    const defaultArms = [
      'translation_beginner',
      'translation_intermediate',
      'transliteration_beginner',
      'listening_beginner',
      'speaking_beginner'
    ];

    const rlState = await this.create({
      userId,
      algorithm,
      epsilon: 0.1,
      explorationRate: 0.5
    });

    await rlState.initializeArms(defaultArms);
    return rlState;
  };

  return RLState;
};