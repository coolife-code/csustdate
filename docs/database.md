# 数据库设计文档

## 数据库概述

- **数据库类型**：SQLite 3
- **存储方式**：单文件数据库（datedrop.sqlite）
- **字符集**：UTF-8
- **适用场景**：中小型应用，万级用户

## 为什么选择 SQLite？

### 优势

1. **零内存占用**：数据库服务本身不占用内存，适合2G内存服务器
2. **零配置**：无需安装和配置数据库服务
3. **易于部署**：单文件数据库，备份只需复制文件
4. **性能优秀**：对于中小型应用，性能足够
5. **易于迁移**：Sequelize ORM 支持无缝迁移到 MySQL

### SQLite 优化配置

```sql
PRAGMA journal_mode=WAL;        -- 启用 WAL 模式，提高并发性能
PRAGMA synchronous=NORMAL;      -- 平衡性能和数据安全
PRAGMA cache_size=5000;         -- 增加缓存大小
PRAGMA temp_store=MEMORY;       -- 临时表存储在内存中
PRAGMA foreign_keys=ON;         -- 启用外键约束
```

## 数据表设计

### 1. 用户表 (users)

存储用户的基本信息和认证信息。

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  gender VARCHAR(10) CHECK(gender IN ('male', 'female', 'other')),
  birth_date DATE,
  college VARCHAR(100),
  major VARCHAR(100),
  grade VARCHAR(20),
  bio TEXT,
  avatar_url VARCHAR(500),
  wechat VARCHAR(100),
  qq VARCHAR(100),
  phone VARCHAR(20),
  email_verified INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'banned')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON users(status);
CREATE INDEX idx_email_verified ON users(email_verified);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| email | VARCHAR(255) | 是 | 教育邮箱，唯一 |
| password_hash | VARCHAR(255) | 是 | bcrypt加密的密码 |
| name | VARCHAR(100) | 否 | 真实姓名 |
| gender | ENUM | 否 | 性别：male/female/other |
| birth_date | DATE | 否 | 出生日期 |
| college | VARCHAR(100) | 否 | 所属学院 |
| major | VARCHAR(100) | 否 | 专业 |
| grade | VARCHAR(20) | 否 | 年级 |
| bio | TEXT | 否 | 个人简介 |
| avatar_url | VARCHAR(500) | 否 | 头像图片地址 |
| wechat | VARCHAR(100) | 否 | 微信号 |
| qq | VARCHAR(100) | 否 | QQ号 |
| phone | VARCHAR(20) | 否 | 手机号 |
| email_verified | TINYINT(1) | 是 | 邮箱验证状态，默认0 |
| status | ENUM | 是 | 用户状态，默认active |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

**索引设计**：
- 主键索引：id
- 唯一索引：email（保证邮箱唯一性）
- 普通索引：status（优化状态查询）
- 普通索引：email_verified（优化验证状态查询）

---

### 2. 用户偏好表 (user_preferences)

存储用户的匹配偏好设置。

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  preferred_gender VARCHAR(10) DEFAULT 'both' CHECK(preferred_gender IN ('male', 'female', 'both')),
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 25,
  preferred_colleges TEXT,  -- JSON 字符串
  other_preferences TEXT,   -- JSON 字符串
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_id ON user_preferences(user_id);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user_id | INT | 是 | 关联用户ID，外键 |
| preferred_gender | ENUM | 否 | 期望性别：male/female/both |
| min_age | INT | 否 | 最小年龄偏好，默认18 |
| max_age | INT | 否 | 最大年龄偏好，默认25 |
| preferred_colleges | JSON | 否 | 偏好学院列表，JSON数组 |
| other_preferences | JSON | 否 | 其他偏好设置，JSON对象 |

**JSON字段示例**：

```json
{
  "preferred_colleges": ["计算机学院", "数学学院", "物理学院"],
  "other_preferences": {
    "preferred_grade": ["大二", "大三"],
    "preferred_hobbies": ["编程", "运动"]
  }
}
```

---

### 3. 兴趣标签表 (interests)

存储系统预定义的兴趣爱好标签。

```sql
CREATE TABLE interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_name ON interests(name);
CREATE INDEX idx_category ON interests(category);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| name | VARCHAR(50) | 是 | 标签名称，唯一 |
| category | VARCHAR(50) | 否 | 标签分类 |
| sort_order | INT | 否 | 排序权重，默认0 |

**预置数据**：

```sql
INSERT INTO `interests` (`name`, `category`, `sort_order`) VALUES
('编程', '科技', 1),
('音乐', '艺术', 2),
('运动', '生活', 3),
('阅读', '文化', 4),
('旅行', '生活', 5),
('摄影', '艺术', 6),
('游戏', '娱乐', 7),
('电影', '娱乐', 8),
('美食', '生活', 9),
('绘画', '艺术', 10),
('舞蹈', '艺术', 11),
('健身', '生活', 12),
('篮球', '运动', 13),
('足球', '运动', 14),
('羽毛球', '运动', 15),
('乒乓球', '运动', 16),
('游泳', '运动', 17),
('跑步', '运动', 18),
('瑜伽', '运动', 19),
('书法', '文化', 20);
```

---

### 4. 用户兴趣关联表 (user_interests)

存储用户与兴趣标签的多对多关系。

```sql
CREATE TABLE user_interests (
  user_id INTEGER NOT NULL,
  interest_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, interest_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE INDEX idx_interest_id ON user_interests(interest_id);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | INT | 是 | 用户ID，联合主键 |
| interest_id | INT | 是 | 兴趣ID，联合主键 |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

### 5. 匹配记录表 (matches)

存储每周的匹配记录。

```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  match_score DECIMAL(5,2),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'both_unlocked', 'user1_unlocked', 'user2_unlocked', 'user1_skipped', 'user2_skipped', 'both_skipped')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_week ON matches(user1_id, user2_id, week_number, year);
CREATE INDEX idx_user1 ON matches(user1_id);
CREATE INDEX idx_user2 ON matches(user2_id);
CREATE INDEX idx_status ON matches(status);
CREATE INDEX idx_week_year ON matches(week_number, year);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user1_id | INT | 是 | 用户1的ID（较小的ID） |
| user2_id | INT | 是 | 用户2的ID（较大的ID） |
| match_score | DECIMAL(5,2) | 否 | 匹配分数，0-100 |
| week_number | INT | 是 | 一年中的第几周 |
| year | INT | 是 | 年份 |
| status | ENUM | 是 | 匹配状态 |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

**状态说明**：

| 状态 | 说明 |
|------|------|
| pending | 初始状态，双方都未操作 |
| user1_unlocked | 用户1已解锁 |
| user2_unlocked | 用户2已解锁 |
| both_unlocked | 双方都已解锁（配对成功） |
| user1_skipped | 用户1已跳过 |
| user2_skipped | 用户2已跳过 |
| both_skipped | 双方都已跳过 |

**索引设计**：
- 主键索引：id
- 唯一索引：(user1_id, user2_id, week_number, year) - 防止重复匹配
- 普通索引：user1_id, user2_id - 优化用户查询
- 普通索引：status - 优化状态查询
- 普通索引：(week_number, year) - 优化周查询

---

### 6. 解锁记录表 (unlocks)

存储用户的解锁/跳过操作记录。

```sql
CREATE TABLE unlocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL CHECK(action IN ('unlock', 'skip')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_match_id ON unlocks(match_id);
CREATE INDEX idx_user_id ON unlocks(user_id);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| match_id | INT | 是 | 关联的匹配记录ID |
| user_id | INT | 是 | 执行操作的用户ID |
| action | ENUM | 是 | 操作类型：unlock/skip |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

### 7. 配对关系表 (pairings)

存储成功配对的关系记录。

```sql
CREATE TABLE pairings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'ended')),
  ended_by INTEGER,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user1 ON pairings(user1_id);
CREATE INDEX idx_user2 ON pairings(user2_id);
CREATE INDEX idx_status ON pairings(status);
CREATE INDEX idx_match_id ON pairings(match_id);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user1_id | INT | 是 | 用户1的ID |
| user2_id | INT | 是 | 用户2的ID |
| match_id | INT | 是 | 关联的匹配记录ID |
| status | ENUM | 是 | 配对状态：active/ended |
| ended_by | INT | 否 | 结束配对的用户ID |
| ended_at | TIMESTAMP | 否 | 配对结束时间 |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

---

### 8. 验证码表 (verification_codes)

存储邮箱验证码记录。

```sql
CREATE TABLE verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK(type IN ('register', 'reset_password')),
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_type ON verification_codes(email, type);
CREATE INDEX idx_expires_at ON verification_codes(expires_at);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| email | VARCHAR(255) | 是 | 邮箱地址 |
| code | VARCHAR(6) | 是 | 6位验证码 |
| type | ENUM | 是 | 类型：register/reset_password |
| expires_at | TIMESTAMP | 是 | 过期时间（10分钟后） |
| used | TINYINT(1) | 是 | 是否已使用，默认0 |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

### 9. 学院表 (colleges)

存储长沙理工大学的学院列表。

```sql
CREATE TABLE colleges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_name ON colleges(name);
```

**预置数据**：

```sql
INSERT INTO `colleges` (`name`, `sort_order`) VALUES
('土木工程学院', 1),
('交通运输工程学院', 2),
('水利工程学院', 3),
('电气与信息工程学院', 4),
('能源与动力工程学院', 5),
('机械工程学院', 6),
('材料科学与工程学院', 7),
('化学与食品工程学院', 8),
('经济与管理学院', 9),
('文学与新闻传播学院', 10),
('外国语学院', 11),
('数学与统计学院', 12),
('物理与电子科学学院', 13),
('计算机学院', 14),
('建筑学院', 15),
('设计艺术学院', 16),
('法学院', 17),
('马克思主义学院', 18),
('体育学院', 19),
('国际教育学院', 20);
```

---

### 10. 年级表 (grades)

存储年级选项。

```sql
CREATE TABLE grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(20) NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_name ON grades(name);
```

**预置数据**：

```sql
INSERT INTO `grades` (`name`, `sort_order`) VALUES
('大一', 1),
('大二', 2),
('大三', 3),
('大四', 4),
('研一', 5),
('研二', 6),
('研三', 7),
('博士', 8);
```

---

### 11. 问卷问题表 (questionnaire_questions)

存储问卷的所有问题及其配置。

```sql
CREATE TABLE questionnaire_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section VARCHAR(50) NOT NULL,           -- 所属部分：appearance/personality/values/interests/career/family/expectation/additional
  subsection VARCHAR(50),                  -- 子部分
  question_code VARCHAR(20) NOT NULL,      -- 问题编号如 Q1.1
  question_text TEXT NOT NULL,             -- 问题内容
  question_type VARCHAR(20) NOT NULL,      -- single/multiple
  options JSON NOT NULL,                   -- 选项列表
  weight DECIMAL(3,2) DEFAULT 1.0,         -- 权重
  dimension VARCHAR(50),                   -- 所属维度
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_section ON questionnaire_questions(section);
CREATE INDEX idx_question_code ON questionnaire_questions(question_code);
CREATE INDEX idx_is_active ON questionnaire_questions(is_active);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| section | VARCHAR(50) | 是 | 所属部分 |
| subsection | VARCHAR(50) | 否 | 子部分 |
| question_code | VARCHAR(20) | 是 | 问题编号 |
| question_text | TEXT | 是 | 问题内容 |
| question_type | VARCHAR(20) | 是 | single/multiple |
| options | JSON | 是 | 选项列表 |
| weight | DECIMAL(3,2) | 否 | 权重，默认1.0 |
| dimension | VARCHAR(50) | 否 | 所属维度 |
| sort_order | INT | 否 | 排序 |
| is_active | INT | 否 | 是否启用，默认1 |

**section 枚举值**：

| 值 | 说明 | 权重 |
|------|------|------|
| appearance | 外貌与生活方式 | 15% |
| personality | 性格特征 | 20% |
| values | 价值观与恋爱观 | 25% |
| interests | 兴趣爱好 | 15% |
| career | 学业与规划 | 10% |
| family | 家庭与背景 | 10% |
| expectation | 期望偏好 | 5% |
| additional | 附加问题 | 0% |

**选项 JSON 示例**：

```json
{
  "A": "选项A内容",
  "B": "选项B内容",
  "C": "选项C内容"
}
```

---

### 12. 问卷答案表 (questionnaire_answers)

存储用户填写的问卷答案。

```sql
CREATE TABLE questionnaire_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_value TEXT NOT NULL,              -- 单选为选项字母，多选为JSON数组如 ["A","C"]
  answer_numeric DECIMAL(5,2),             -- 数值化答案（用于计算）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id),
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_user_answer ON questionnaire_answers(user_id);
CREATE INDEX idx_question_answer ON questionnaire_answers(question_id);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user_id | INT | 是 | 用户ID |
| question_id | INT | 是 | 问题ID |
| answer_value | TEXT | 是 | 答案值 |
| answer_numeric | DECIMAL(5,2) | 否 | 数值化答案 |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

---

### 13. 用户特征向量表 (user_vectors)

存储用户的特征向量，用于匹配计算。

```sql
CREATE TABLE user_vectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  vector_appearance TEXT,                  -- 外貌与生活方式向量 JSON
  vector_personality TEXT,                 -- 性格特征向量 JSON
  vector_values TEXT,                      -- 价值观与恋爱观向量 JSON
  vector_interests TEXT,                   -- 兴趣爱好向量 JSON
  vector_career TEXT,                      -- 学业与规划向量 JSON
  vector_family TEXT,                      -- 家庭与背景向量 JSON
  vector_expectation TEXT,                 -- 期望偏好向量 JSON
  vector_combined TEXT,                    -- 综合向量 JSON
  completeness DECIMAL(5,2) DEFAULT 0,     -- 完整度 0-100
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_vector ON user_vectors(user_id);
CREATE INDEX idx_completeness ON user_vectors(completeness);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user_id | INT | 是 | 用户ID，唯一 |
| vector_appearance | JSON | 否 | 外貌向量 |
| vector_personality | JSON | 否 | 性格向量 |
| vector_values | JSON | 否 | 价值观向量 |
| vector_interests | JSON | 否 | 兴趣爱好向量 |
| vector_career | JSON | 否 | 学业规划向量 |
| vector_family | JSON | 否 | 家庭背景向量 |
| vector_expectation | JSON | 否 | 期望偏好向量 |
| vector_combined | JSON | 否 | 综合向量 |
| completeness | DECIMAL(5,2) | 否 | 问卷完成度 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

**向量 JSON 示例**：

```json
{
  "Q1.1": 4,
  "Q1.2": 3,
  "Q1.4": 2,
  "dimension_avg": {
    "appearance_height": 3.5,
    "appearance_lifestyle": 4.0
  }
}
```

---

### 14. 匹配历史表 (match_history)

记录用户匹配过的对象，用于后续轮次过滤。

```sql
CREATE TABLE match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  matched_user_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,           -- 第几轮匹配
  match_score DECIMAL(5,2),                -- 当次的匹配分数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, matched_user_id)
);

CREATE INDEX idx_user_history ON match_history(user_id);
CREATE INDEX idx_matched_user ON match_history(matched_user_id);
CREATE INDEX idx_round ON match_history(round_number);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user_id | INT | 是 | 用户ID |
| matched_user_id | INT | 是 | 匹配过的用户ID |
| round_number | INT | 是 | 匹配轮次 |
| match_score | DECIMAL(5,2) | 否 | 匹配分数 |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

### 15. 匹配轮次表 (match_rounds)

管理匹配轮次的状态。

```sql
CREATE TABLE match_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_number INTEGER NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'cancelled')),
  started_at DATETIME,
  completed_at DATETIME,
  total_users INTEGER DEFAULT 0,
  matched_pairs INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_round_status ON match_rounds(status);
CREATE INDEX idx_year_round ON match_rounds(year, round_number);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| round_number | INT | 是 | 轮次编号 |
| year | INT | 是 | 年份 |
| status | ENUM | 否 | 状态 |
| started_at | TIMESTAMP | 否 | 开始时间 |
| completed_at | TIMESTAMP | 否 | 完成时间 |
| total_users | INT | 否 | 参与用户数 |
| matched_pairs | INT | 否 | 配对成功数 |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

**状态说明**：

| 状态 | 说明 |
|------|------|
| pending | 待开始 |
| running | 进行中 |
| completed | 已完成 |
| cancelled | 已取消 |

---

### 16. 用户偏好排序表 (user_preference_rankings)

存储每个用户对候选人的偏好排序列表。

```sql
CREATE TABLE user_preference_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  preference_rank INTEGER NOT NULL,        -- 偏好排名 1=最喜欢
  compatibility_score DECIMAL(5,2),       -- 合拍程度分数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, candidate_id, round_number)
);

CREATE INDEX idx_user_rank ON user_preference_rankings(user_id, round_number);
CREATE INDEX idx_candidate_rank ON user_preference_rankings(candidate_id, round_number);
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INT | 是 | 主键，自增 |
| user_id | INT | 是 | 用户ID |
| candidate_id | INT | 是 | 候选用户ID |
| round_number | INT | 是 | 匹配轮次 |
| preference_rank | INT | 是 | 偏好排名 |
| compatibility_score | DECIMAL(5,2) | 否 | 合拍分数 |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

## 修改现有表

### 修改 matches 表

增加 `round_number` 字段支持多轮匹配：

```sql
ALTER TABLE matches ADD COLUMN round_number INTEGER DEFAULT 1;

CREATE INDEX idx_round ON matches(round_number);
```

### 修改 user_preferences 表

增加问卷相关的偏好字段：

```sql
ALTER TABLE user_preferences ADD COLUMN preferred_height VARCHAR(50);
ALTER TABLE user_preferences ADD COLUMN preferred_body_type TEXT;
ALTER TABLE user_preferences ADD COLUMN preferred_personality TEXT;
ALTER TABLE user_preferences ADD COLUMN deal_breakers TEXT;
```

**新增字段 JSON 示例**：

```json
{
  "preferred_height": "170-180",
  "preferred_body_type": ["匀称型", "健壮型"],
  "preferred_personality": ["外向", "理性"],
  "deal_breakers": ["抽烟", "沉迷游戏"]
}
```

---

## 数据库关系图

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├─────────────────────────────────────────────┐
       │                     │                       │
       │ 1:1                 │ 1:N                   │ 1:N
       ▼                     ▼                       ▼
┌─────────────────────┐ ┌─────────────┐     ┌─────────────────┐
│ user_preferences    │ │user_interests│     │questionnaire_   │
└─────────────────────┘ └──────┬──────┘     │    answers      │
                               │            └────────┬────────┘
                               │ N:M                 │
                               ▼                     │
                        ┌─────────────┐              │
                        │  interests  │              │
                        └─────────────┘              │
                                                     │
       ┌─────────────────────────────────────────────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│user_vectors │
└─────────────┘

┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├─────────────────────────────────────────────┐
       │                     │                       │
       │ 1:N                 │ 1:N                   │ 1:N
       ▼                     ▼                       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   matches   │──────►│   unlocks   │       │match_history│
└──────┬──────┘       └─────────────┘       └─────────────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│  pairings   │
└─────────────┘

┌─────────────────────┐
│ verification_codes  │
└─────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  colleges   │       │   grades    │       │match_rounds │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│questionnaire_       │       │user_preference_     │
│    questions        │       │     rankings        │
└─────────────────────┘       └─────────────────────┘
```

## 索引优化策略

### 1. 主键索引
所有表都有自增主键，InnoDB会自动创建聚簇索引。

### 2. 唯一索引
- `users.email`：保证邮箱唯一性
- `user_preferences.user_id`：保证一个用户只有一条偏好记录
- `interests.name`：保证标签名称唯一
- `colleges.name`：保证学院名称唯一
- `grades.name`：保证年级名称唯一

### 3. 联合唯一索引
- `matches(user1_id, user2_id, week_number, year)`：防止同一周重复匹配

### 4. 普通索引
- 用于优化常用查询条件的字段
- 外键字段自动创建索引

## 查询优化建议

### 1. 用户匹配查询

```sql
SELECT m.*, 
       u1.name as user1_name, u1.college as user1_college,
       u2.name as user2_name, u2.college as user2_college
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id
WHERE (m.user1_id = ? OR m.user2_id = ?)
  AND m.week_number = ?
  AND m.year = ?
  AND m.status = 'pending';
```

### 2. 用户兴趣查询

```sql
SELECT i.name, i.category
FROM interests i
JOIN user_interests ui ON i.id = ui.interest_id
WHERE ui.user_id = ?
ORDER BY i.category, i.name;
```

### 3. 活跃配对查询

```sql
SELECT p.*, 
       u1.name as user1_name, u1.email as user1_email,
       u2.name as user2_name, u2.email as user2_email
FROM pairings p
JOIN users u1 ON p.user1_id = u1.id
JOIN users u2 ON p.user2_id = u2.id
WHERE (p.user1_id = ? OR p.user2_id = ?)
  AND p.status = 'active';
```

### 4. 匹配历史查询

```sql
SELECT m.*, 
       CASE 
         WHEN m.user1_id = ? THEN u2.name
         ELSE u1.name
       END as match_name,
       CASE 
         WHEN m.user1_id = ? THEN u2.college
         ELSE u1.college
       END as match_college
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id
WHERE (m.user1_id = ? OR m.user2_id = ?)
ORDER BY m.created_at DESC
LIMIT ? OFFSET ?;
```

### 5. 用户问卷答案查询

```sql
SELECT q.question_code, q.question_text, q.section, 
       a.answer_value, a.answer_numeric
FROM questionnaire_answers a
JOIN questionnaire_questions q ON a.question_id = q.id
WHERE a.user_id = ?
ORDER BY q.section, q.sort_order;
```

### 6. 用户特征向量查询

```sql
SELECT u.id, u.name, u.gender, u.college,
       v.vector_appearance, v.vector_personality, 
       v.vector_values, v.vector_combined, v.completeness
FROM user_vectors v
JOIN users u ON v.user_id = u.id
WHERE v.completeness >= 50
ORDER BY v.completeness DESC;
```

### 7. 候选用户过滤查询

```sql
SELECT u.id, u.name, u.gender, u.college, u.major,
       v.vector_combined, v.completeness
FROM users u
LEFT JOIN user_vectors v ON u.id = v.user_id
WHERE u.status = 'active'
  AND u.email_verified = 1
  AND u.gender != ?  -- 过滤同性
  AND u.id NOT IN (
    SELECT matched_user_id FROM match_history WHERE user_id = ?
  )
  AND v.completeness >= 50
ORDER BY v.completeness DESC;
```

### 8. 用户偏好排序查询

```sql
SELECT r.user_id, r.candidate_id, r.preference_rank, r.compatibility_score,
       u.name as candidate_name, u.college, u.major
FROM user_preference_rankings r
JOIN users u ON r.candidate_id = u.id
WHERE r.user_id = ? AND r.round_number = ?
ORDER BY r.preference_rank ASC;
```

### 9. 匹配轮次统计查询

```sql
SELECT mr.*, 
       COUNT(DISTINCT m.id) as match_count,
       COUNT(DISTINCT CASE WHEN m.status = 'both_unlocked' THEN m.id END) as success_count
FROM match_rounds mr
LEFT JOIN matches m ON m.round_number = mr.round_number
WHERE mr.year = ?
GROUP BY mr.id
ORDER BY mr.round_number DESC;
```

## 数据库维护

### 1. 定期清理过期验证码

```sql
DELETE FROM verification_codes 
WHERE expires_at < NOW() OR used = 1;
```

### 2. 定期归档历史匹配记录

```sql
CREATE TABLE matches_archive LIKE matches;

INSERT INTO matches_archive
SELECT * FROM matches
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

DELETE FROM matches
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### 3. 优化表

```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE matches;
OPTIMIZE TABLE pairings;
```

### 4. 分析表

```sql
ANALYZE TABLE users;
ANALYZE TABLE matches;
ANALYZE TABLE pairings;
```

## 备份策略

### 1. 全量备份（每天）

```bash
# SQLite 备份非常简单，只需复制数据库文件
cp database/datedrop.sqlite backups/datedrop_$(date +%Y%m%d).sqlite

# 压缩备份
gzip backups/datedrop_$(date +%Y%m%d).sqlite
```

### 2. 自动备份脚本

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/datedrop"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/var/www/datedrop/backend/database/datedrop.sqlite"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 复制并压缩数据库文件
cp ${DB_FILE} ${BACKUP_DIR}/datedrop_${DATE}.sqlite
gzip ${BACKUP_DIR}/datedrop_${DATE}.sqlite

# 删除7天前的备份
find ${BACKUP_DIR} -name "*.gz" -mtime +7 -delete

echo "Backup completed: datedrop_${DATE}.sqlite.gz"
```

### 3. 在线备份（不停止服务）

```bash
# 使用 SQLite 的 .backup 命令
sqlite3 database/datedrop.sqlite ".backup 'backups/datedrop_backup.sqlite'"
```

## 性能监控

### 1. 数据库状态检查

```bash
# 查看数据库文件大小
ls -lh database/datedrop.sqlite

# 查看数据库信息
sqlite3 database/datedrop.sqlite "PRAGMA database_list;"

# 查看表信息
sqlite3 database/datedrop.sqlite ".tables"
sqlite3 database/datedrop.sqlite ".schema users"
```

### 2. 性能分析

```sql
-- 查看查询计划
EXPLAIN QUERY PLAN SELECT * FROM matches WHERE user1_id = 1;

-- 查看索引使用情况
PRAGMA index_list('users');
PRAGMA index_info('idx_email');

-- 分析统计信息
ANALYZE;
```

### 3. 数据库优化

```sql
-- 重建数据库（清理碎片）
VACUUM;

-- 重新分析统计信息
ANALYZE;

-- 检查完整性
PRAGMA integrity_check;
```

## 数据安全

### 1. 敏感字段加密
- 密码使用 bcrypt 加密存储
- 联系方式可考虑加密存储（可选）

### 2. 数据脱敏
- 日志中不记录敏感信息
- API返回时过滤敏感字段

### 3. 文件权限控制
- 数据库文件权限设置为 600（仅所有者可读写）
- 定期检查文件权限

```bash
# 设置数据库文件权限
chmod 600 database/datedrop.sqlite
chown www-data:www-data database/datedrop.sqlite

# 设置数据库目录权限
chmod 700 database/
chown www-data:www-data database/
```

### 4. 数据库加密（可选）

SQLite 支持使用 SQLCipher 进行加密：

```javascript
// 使用 SQLCipher 加密数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/datedrop.sqlite',
  dialectOptions: {
    key: process.env.DB_ENCRYPTION_KEY
  }
})
```

## 迁移到 MySQL

如果未来用户量增长，可以轻松迁移到 MySQL：

### 1. 导出 SQLite 数据

```bash
sqlite3 database/datedrop.sqlite .dump > dump.sql
```

### 2. 修改 Sequelize 配置

```javascript
// 从
dialect: 'sqlite'
storage: './database/datedrop.sqlite'

// 改为
dialect: 'mysql'
host: 'localhost'
database: 'datedrop'
username: 'root'
password: 'password'
```

### 3. 导入到 MySQL

```bash
# 需要调整 SQL 语法后导入
mysql -u root -p datedrop < dump.sql
```

Sequelize ORM 会自动处理大部分差异，代码几乎不需要修改。
