# DateDrop 文档更新计划

## 概述

根据新的问卷设计和匹配流程，更新项目所有文档以保持一致性。

## 确认的设计决策

1. **问卷长度**：保持完整问卷（80+题），后续可灵活调整
2. **匹配算法**：使用稳定室友算法（Stable Roommate）
3. **向量化方式**：简单加权编码

---

## 更新任务清单

### 1. 数据库设计更新 (database.md)

**新增数据表：**

#### 1.1 问卷问题表 (questionnaire_questions)
```sql
CREATE TABLE questionnaire_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section VARCHAR(50) NOT NULL,           -- 所属部分
  subsection VARCHAR(50),                  -- 子部分
  question_code VARCHAR(20) NOT NULL,      -- 问题编号如 Q1.1
  question_text TEXT NOT NULL,             -- 问题内容
  question_type VARCHAR(20) NOT NULL,      -- single/multiple
  options JSON NOT NULL,                   -- 选项列表
  weight DECIMAL(3,2) DEFAULT 1.0,         -- 权重
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 问卷答案表 (questionnaire_answers)
```sql
CREATE TABLE questionnaire_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_value TEXT NOT NULL,              -- 单选为选项字母，多选为JSON数组
  answer_numeric DECIMAL(5,2),             -- 数值化答案（用于计算）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id),
  UNIQUE(user_id, question_id)
);
```

#### 1.3 用户特征向量表 (user_vectors)
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 1.4 匹配历史表 (match_history)
```sql
CREATE TABLE match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  matched_user_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,           -- 第几轮匹配
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, matched_user_id)
);
```

#### 1.5 匹配轮次表 (match_rounds)
```sql
CREATE TABLE match_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_number INTEGER NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',    -- pending/running/completed
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**修改现有表：**
- `matches` 表增加 `round_number` 字段
- `user_preferences` 表增加问卷相关偏好字段

---

### 2. API 接口更新 (api.md)

**新增接口：**

#### 2.1 问卷相关接口

```
GET  /api/questionnaire/questions       # 获取问卷问题列表
POST /api/questionnaire/answers         # 提交问卷答案
GET  /api/questionnaire/answers         # 获取当前用户答案
PUT  /api/questionnaire/answers         # 更新问卷答案
GET  /api/questionnaire/progress        # 获取填写进度
```

#### 2.2 匹配相关接口（更新）

```
GET  /api/matches/candidates            # 获取当前轮次候选列表
GET  /api/matches/rankings              # 获取用户偏好排序
POST /api/matches/confirm               # 确认匹配结果
```

---

### 3. 后端服务更新 (backend.md)

**新增服务：**

#### 3.1 问卷服务 (questionnaireService.js)
- 问题管理
- 答案存储
- 向量化计算

#### 3.2 向量化服务 (vectorService.js)
- 答案数值化
- 维度向量生成
- 综合向量计算

#### 3.3 匹配服务更新 (matchService.js)
- 候选过滤
- 合拍度计算
- 稳定室友算法实现
- 多轮匹配管理

**稳定室友算法核心逻辑：**
```javascript
class StableRoommate {
  // 第一阶段：初始化偏好列表
  initPreferenceLists(users) { ... }
  
  // 第二阶段：提案和拒绝
  proposeAndReject(preferenceLists) { ... }
  
  // 第三阶段：循环检测和解决
  resolveCycles(preferenceLists) { ... }
  
  // 主入口
  match(users) { ... }
}
```

---

### 4. 前端页面更新 (frontend.md)

**新增页面：**

#### 4.1 问卷填写页面
- 分步填写（8个部分）
- 进度保存
- 进度条显示

#### 4.2 匹配结果页面更新
- 显示匹配轮次
- 显示合拍度分数
- 显示匹配理由

**新增组件：**
- QuestionnaireSection.vue - 问卷部分组件
- QuestionProgress.vue - 进度组件
- MatchReasonCard.vue - 匹配理由卡片

---

### 5. README.md 更新

**更新内容：**

#### 5.1 匹配算法设计部分
- 更新为稳定室友算法
- 更新评分维度（7个维度）
- 更新权重分配

#### 5.2 匹配流程部分
- 更新为新的6步流程
- 增加多轮匹配说明

#### 5.3 功能需求部分
- 增加问卷填写模块
- 更新匹配系统描述

---

### 6. 问卷文档补充 (questionnaire.md)

**补充内容：**
- 向量化规则
- 分数计算公式
- 权重配置表

---

### 7. 匹配流程文档补充 (匹配流程.md)

**补充内容：**
- 稳定室友算法详细说明
- 边界情况处理
- 性能优化策略

---

## 实施顺序

1. **第一阶段：数据库设计**
   - 更新 database.md
   - 设计新表结构
   - 设计索引

2. **第二阶段：API 设计**
   - 更新 api.md
   - 定义新接口
   - 定义请求/响应格式

3. **第三阶段：后端服务**
   - 更新 backend.md
   - 设计服务架构
   - 设计算法实现

4. **第四阶段：前端页面**
   - 更新 frontend.md
   - 设计页面结构
   - 设计组件

5. **第五阶段：主文档**
   - 更新 README.md
   - 更新 questionnaire.md
   - 更新 匹配流程.md

---

## 预估工作量

| 文档 | 预估内容量 | 优先级 |
|------|-----------|--------|
| database.md | 新增约200行 | 高 |
| api.md | 新增约150行 | 高 |
| backend.md | 新增约300行 | 高 |
| frontend.md | 新增约200行 | 中 |
| README.md | 修改约100行 | 中 |
| questionnaire.md | 补充约100行 | 低 |
| 匹配流程.md | 补充约150行 | 低 |

---

## 注意事项

1. **向后兼容**：新设计需要兼容现有用户数据
2. **性能考虑**：问卷向量化计算需要优化
3. **用户体验**：问卷填写需要支持断点续填
4. **数据迁移**：需要考虑现有用户如何填写问卷
