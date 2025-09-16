-- Vanitya Database Schema
-- PostgreSQL Database Schema for Language Learning Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'email',
    provider_id VARCHAR(255),
    prefs JSONB DEFAULT '{}',
    current_language VARCHAR(10) DEFAULT 'hi',
    target_language VARCHAR(10) DEFAULT 'te',
    level VARCHAR(20) DEFAULT 'beginner',
    hearts INTEGER DEFAULT 5,
    max_hearts INTEGER DEFAULT 5,
    streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id VARCHAR(50) NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    exercise_type VARCHAR(30) NOT NULL CHECK (exercise_type IN ('translation', 'transliteration', 'listening', 'speaking', 'matching')),
    original_question TEXT NOT NULL,
    original_options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    hint TEXT,
    explanation TEXT,
    sarvam_generated_json JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    attempts INTEGER DEFAULT 0,
    correct BOOLEAN DEFAULT FALSE,
    last_answer TEXT,
    response_time_ms INTEGER,
    needs_retry BOOLEAN DEFAULT FALSE,
    hint_used BOOLEAN DEFAULT FALSE,
    audio_played BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exercise_id)
);

-- API Usage tracking table
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    credits_used INTEGER DEFAULT 1,
    credits_remaining INTEGER,
    request_payload JSONB,
    response_status INTEGER,
    error_message TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_exercises_unit ON exercises(unit_id);
CREATE INDEX idx_exercises_languages ON exercises(source_language, target_language);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_status ON exercises(status);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_exercise ON user_progress(exercise_id);
CREATE INDEX idx_api_usage_provider ON api_usage(provider);
CREATE INDEX idx_api_usage_created ON api_usage(created_at);