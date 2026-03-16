-- Utilisateurs (Élèves et Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    series ENUM('C', 'D') NOT NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Matières (Maths, Physique, Sciences Nat)
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NULL,
    color_theme VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapitres
CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Leçons / Cours
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    video_url VARCHAR(255) NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Fiches de révision
CREATE TABLE IF NOT EXISTS revision_sheets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary_content LONGTEXT NOT NULL,
    pdf_url VARCHAR(255) NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Quiz (Évaluations)
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NULL,
    subject_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty ENUM('easy', 'medium', 'hard', 'bac') DEFAULT 'medium',
    time_limit_minutes INT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Questions de Quiz
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT NULL,
    points INT DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Réponses aux Questions (QCM)
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Tentatives de Quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_points INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Planning d'étude personnalisé
CREATE TABLE IF NOT EXISTS study_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Séances de révision
CREATE TABLE IF NOT EXISTS study_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    study_plan_id INT NOT NULL,
    subject_id INT NOT NULL,
    chapter_id INT NULL,
    scheduled_date DATE NOT NULL,
    duration_minutes INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Progression
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'needs_review') DEFAULT 'not_started',
    mastery_level INT DEFAULT 0,
    last_studied_at TIMESTAMP NULL,
    UNIQUE KEY user_chapter_unique (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Annales
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    series ENUM('C', 'D') NOT NULL,
    year INT NOT NULL,
    session ENUM('normale', 'complementaire') NOT NULL,
    pdf_statement_url VARCHAR(255) NOT NULL,
    pdf_correction_url VARCHAR(255) NULL,
    solution_content LONGTEXT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- IA Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    context_type ENUM('general', 'lesson', 'quiz', 'exam') DEFAULT 'general',
    context_id INT NULL,
    title VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- IA Messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);
