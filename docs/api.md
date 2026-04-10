# API 接口文档

## 基础信息

- **Base URL**: `https://datedrop.csust.edu.cn/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用说明

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱已存在） |
| 422 | 验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 1. 认证相关接口

### 1.1 发送验证码

发送邮箱验证码，用于注册或找回密码。

**请求**

```http
POST /api/auth/send-code
```

**请求体**

```json
{
  "email": "student@csust.edu.cn",
  "type": "register"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 教育邮箱，必须以@csust.edu.cn结尾 |
| type | string | 是 | 类型：register（注册）或 reset_password（重置密码） |

**响应示例**

```json
{
  "success": true,
  "message": "验证码已发送到您的邮箱"
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| INVALID_EMAIL | 邮箱格式不正确 |
| NOT_CSUST_EMAIL | 不是长沙理工大学邮箱 |
| EMAIL_EXISTS | 邮箱已被注册（注册时） |
| EMAIL_NOT_FOUND | 邮箱未注册（重置密码时） |
| CODE_SEND_TOO_FREQUENT | 验证码发送过于频繁 |

---

### 1.2 注册

使用邮箱验证码注册新用户。

**请求**

```http
POST /api/auth/register
```

**请求体**

```json
{
  "email": "student@csust.edu.cn",
  "password": "Password123",
  "code": "123456"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 教育邮箱 |
| password | string | 是 | 密码，至少8位，包含字母和数字 |
| code | string | 是 | 6位验证码 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@csust.edu.cn",
      "email_verified": true,
      "created_at": "2024-04-08T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| INVALID_CODE | 验证码错误或已过期 |
| EMAIL_EXISTS | 邮箱已被注册 |
| WEAK_PASSWORD | 密码强度不足 |

---

### 1.3 登录

使用邮箱和密码登录。

**请求**

```http
POST /api/auth/login
```

**请求体**

```json
{
  "email": "student@csust.edu.cn",
  "password": "Password123"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 教育邮箱 |
| password | string | 是 | 密码 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@csust.edu.cn",
      "name": "张三",
      "gender": "male",
      "college": "计算机学院",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "登录成功"
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| INVALID_CREDENTIALS | 邮箱或密码错误 |
| ACCOUNT_BANNED | 账号已被封禁 |
| ACCOUNT_INACTIVE | 账号未激活 |

---

### 1.4 登出

退出登录，使当前token失效。

**请求**

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 1.5 重置密码

使用验证码重置密码。

**请求**

```http
POST /api/auth/reset-password
```

**请求体**

```json
{
  "email": "student@csust.edu.cn",
  "code": "123456",
  "new_password": "NewPassword123"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 教育邮箱 |
| code | string | 是 | 6位验证码 |
| new_password | string | 是 | 新密码，至少8位，包含字母和数字 |

**响应示例**

```json
{
  "success": true,
  "message": "密码重置成功"
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| INVALID_CODE | 验证码错误或已过期 |
| WEAK_PASSWORD | 密码强度不足 |

---

### 1.6 获取当前用户信息

获取当前登录用户的详细信息。

**请求**

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@csust.edu.cn",
    "name": "张三",
    "gender": "male",
    "birth_date": "2000-01-01",
    "college": "计算机学院",
    "major": "软件工程",
    "grade": "大三",
    "bio": "热爱编程，喜欢运动",
    "avatar_url": "https://example.com/avatar.jpg",
    "wechat": "wxid123",
    "qq": "123456789",
    "phone": "13800138000",
    "email_verified": true,
    "status": "active",
    "created_at": "2024-04-08T10:00:00Z",
    "updated_at": "2024-04-08T12:00:00Z"
  }
}
```

---

## 2. 用户相关接口

### 2.1 获取用户资料

获取当前用户的完整资料。

**请求**

```http
GET /api/users/profile
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@csust.edu.cn",
      "name": "张三",
      "gender": "male",
      "birth_date": "2000-01-01",
      "college": "计算机学院",
      "major": "软件工程",
      "grade": "大三",
      "bio": "热爱编程，喜欢运动",
      "avatar_url": "https://example.com/avatar.jpg",
      "wechat": "wxid123",
      "qq": "123456789",
      "phone": "13800138000"
    },
    "preferences": {
      "preferred_gender": "female",
      "min_age": 18,
      "max_age": 25,
      "preferred_colleges": ["计算机学院", "数学学院"]
    },
    "interests": [
      { "id": 1, "name": "编程", "category": "科技" },
      { "id": 3, "name": "运动", "category": "生活" }
    ]
  }
}
```

---

### 2.2 更新用户资料

更新用户的基本信息。

**请求**

```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**请求体**

```json
{
  "name": "张三",
  "gender": "male",
  "birth_date": "2000-01-01",
  "college": "计算机学院",
  "major": "软件工程",
  "grade": "大三",
  "bio": "热爱编程，喜欢运动和音乐",
  "wechat": "wxid123",
  "qq": "123456789",
  "phone": "13800138000"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 姓名 |
| gender | string | 否 | 性别：male/female/other |
| birth_date | string | 否 | 出生日期，格式：YYYY-MM-DD |
| college | string | 否 | 学院 |
| major | string | 否 | 专业 |
| grade | string | 否 | 年级 |
| bio | string | 否 | 个人简介，最多500字 |
| wechat | string | 否 | 微信号 |
| qq | string | 否 | QQ号 |
| phone | string | 否 | 手机号 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "gender": "male",
    "birth_date": "2000-01-01",
    "college": "计算机学院",
    "major": "软件工程",
    "grade": "大三",
    "bio": "热爱编程，喜欢运动和音乐",
    "updated_at": "2024-04-08T12:00:00Z"
  },
  "message": "资料更新成功"
}
```

---

### 2.3 更新匹配偏好

更新用户的匹配偏好设置。

**请求**

```http
PUT /api/users/preferences
Authorization: Bearer <token>
```

**请求体**

```json
{
  "preferred_gender": "female",
  "min_age": 18,
  "max_age": 25,
  "preferred_colleges": ["计算机学院", "数学学院", "物理学院"]
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| preferred_gender | string | 否 | 期望性别：male/female/both |
| min_age | number | 否 | 最小年龄，18-30 |
| max_age | number | 否 | 最大年龄，18-30 |
| preferred_colleges | array | 否 | 偏好学院列表 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "preferred_gender": "female",
    "min_age": 18,
    "max_age": 25,
    "preferred_colleges": ["计算机学院", "数学学院", "物理学院"]
  },
  "message": "偏好设置更新成功"
}
```

---

### 2.4 更新兴趣爱好

更新用户的兴趣爱好标签。

**请求**

```http
PUT /api/users/interests
Authorization: Bearer <token>
```

**请求体**

```json
{
  "interest_ids": [1, 2, 3, 5, 8]
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| interest_ids | array | 是 | 兴趣标签ID数组，最多选择10个 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "interests": [
      { "id": 1, "name": "编程", "category": "科技" },
      { "id": 2, "name": "音乐", "category": "艺术" },
      { "id": 3, "name": "运动", "category": "生活" },
      { "id": 5, "name": "旅行", "category": "生活" },
      { "id": 8, "name": "电影", "category": "娱乐" }
    ]
  },
  "message": "兴趣爱好更新成功"
}
```

---

### 2.5 获取兴趣标签列表

获取系统预定义的所有兴趣标签。

**请求**

```http
GET /api/users/interests
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "interests": [
      { "id": 1, "name": "编程", "category": "科技" },
      { "id": 2, "name": "音乐", "category": "艺术" },
      { "id": 3, "name": "运动", "category": "生活" },
      { "id": 4, "name": "阅读", "category": "文化" },
      { "id": 5, "name": "旅行", "category": "生活" }
    ]
  }
}
```

---

### 2.6 获取学院列表

获取长沙理工大学所有学院列表。

**请求**

```http
GET /api/users/colleges
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "colleges": [
      { "id": 1, "name": "土木工程学院" },
      { "id": 2, "name": "交通运输工程学院" },
      { "id": 3, "name": "水利工程学院" },
      { "id": 4, "name": "电气与信息工程学院" },
      { "id": 14, "name": "计算机学院" }
    ]
  }
}
```

---

### 2.7 获取年级列表

获取所有年级选项。

**请求**

```http
GET /api/users/grades
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "grades": [
      { "id": 1, "name": "大一" },
      { "id": 2, "name": "大二" },
      { "id": 3, "name": "大三" },
      { "id": 4, "name": "大四" },
      { "id": 5, "name": "研一" },
      { "id": 6, "name": "研二" },
      { "id": 7, "name": "研三" },
      { "id": 8, "name": "博士" }
    ]
  }
}
```

---

## 3. 匹配相关接口

### 3.1 获取当前周匹配

获取当前周的匹配对象信息。

**请求**

```http
GET /api/matches/current
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "match": {
      "id": 123,
      "match_score": 85.5,
      "week_number": 15,
      "year": 2024,
      "status": "pending",
      "created_at": "2024-04-09T00:00:00Z",
      "match_user": {
        "id": 2,
        "name": "李四",
        "gender": "female",
        "college": "数学学院",
        "major": "应用数学",
        "grade": "大二",
        "bio": "喜欢数学和音乐",
        "interests": [
          { "id": 2, "name": "音乐", "category": "艺术" },
          { "id": 12, "name": "健身", "category": "生活" }
        ]
      }
    },
    "my_action": null
  }
}
```

**字段说明**

| 字段 | 说明 |
|------|------|
| match | 匹配记录信息 |
| match_user | 匹配对象的公开信息（不包含联系方式） |
| my_action | 当前用户的操作：null/unlock/skip |

---

### 3.2 解锁匹配对象

对当前匹配对象表示感兴趣。

**请求**

```http
POST /api/matches/:matchId/unlock
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| matchId | number | 匹配记录ID |

**响应示例（单向解锁）**

```json
{
  "success": true,
  "data": {
    "match_id": 123,
    "status": "user1_unlocked",
    "message": "已解锁，等待对方确认"
  }
}
```

**响应示例（双向解锁）**

```json
{
  "success": true,
  "data": {
    "match_id": 123,
    "status": "both_unlocked",
    "pairing_id": 45,
    "message": "恭喜！对方也解锁了你，联系方式已发送到你的邮箱"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| MATCH_NOT_FOUND | 匹配记录不存在 |
| ALREADY_UNLOCKED | 已经解锁过了 |
| ALREADY_SKIPPED | 已经跳过了 |

---

### 3.3 跳过匹配对象

对当前匹配对象不感兴趣。

**请求**

```http
POST /api/matches/:matchId/skip
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| matchId | number | 匹配记录ID |

**响应示例**

```json
{
  "success": true,
  "data": {
    "match_id": 123,
    "status": "user1_skipped",
    "message": "已跳过，下周将为你匹配新对象"
  }
}
```

---

### 3.4 获取匹配历史

获取历史匹配记录。

**请求**

```http
GET /api/matches/history?page=1&limit=10
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10，最大20 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": 122,
        "week_number": 14,
        "year": 2024,
        "status": "both_skipped",
        "created_at": "2024-04-02T00:00:00Z",
        "match_user": {
          "id": 3,
          "name": "王五",
          "college": "外语学院",
          "major": "英语"
        }
      },
      {
        "id": 121,
        "week_number": 13,
        "year": 2024,
        "status": "both_unlocked",
        "created_at": "2024-03-26T00:00:00Z",
        "match_user": {
          "id": 4,
          "name": "赵六",
          "college": "物理学院",
          "major": "应用物理"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

---

## 4. 配对相关接口

### 4.1 获取当前配对

获取当前活跃的配对关系。

**请求**

```http
GET /api/pairings/active
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "pairing": {
      "id": 45,
      "status": "active",
      "created_at": "2024-04-09T00:00:00Z",
      "match_user": {
        "id": 2,
        "name": "李四",
        "gender": "female",
        "college": "数学学院",
        "major": "应用数学",
        "grade": "大二",
        "email": "lisi@csust.edu.cn",
        "wechat": "lisi_wx",
        "qq": "123456789",
        "phone": "13900139000"
      }
    }
  }
}
```

**说明**

- 只有在双向解锁后，才能看到对方的联系方式
- 如果没有活跃配对，返回 `data: null`

---

### 4.2 解除配对

结束当前的配对关系。

**请求**

```http
POST /api/pairings/:pairingId/end
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| pairingId | number | 配对记录ID |

**响应示例**

```json
{
  "success": true,
  "data": {
    "pairing_id": 45,
    "status": "ended",
    "message": "配对已解除，下周将为你匹配新对象"
  }
}
```

**错误码**

| 错误码 | 说明 |
|--------|------|
| PAIRING_NOT_FOUND | 配对记录不存在 |
| PAIRING_ALREADY_ENDED | 配对已经结束 |

---

### 4.3 获取配对历史

获取历史配对记录。

**请求**

```http
GET /api/pairings/history?page=1&limit=10
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10，最大20 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "pairings": [
      {
        "id": 44,
        "status": "ended",
        "created_at": "2024-03-12T00:00:00Z",
        "ended_at": "2024-04-02T00:00:00Z",
        "ended_by": 1,
        "match_user": {
          "id": 5,
          "name": "王五",
          "college": "外语学院",
          "major": "英语"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

## 5. 系统相关接口

### 5.1 健康检查

检查服务是否正常运行。

**请求**

```http
GET /api/health
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-04-08T12:00:00Z",
    "uptime": 86400
  }
}
```

---

### 5.2 获取系统统计

获取系统统计数据（可选，需要管理员权限）。

**请求**

```http
GET /api/system/stats
Authorization: Bearer <admin_token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "active_users": 980,
    "total_matches": 3500,
    "successful_pairings": 450,
    "weekly_active_pairings": 120
  }
}
```

---

## 错误码汇总

### 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| INVALID_REQUEST | 400 | 请求参数错误 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| VALIDATION_ERROR | 422 | 验证失败 |
| RATE_LIMIT_EXCEEDED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 认证相关错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_EMAIL | 邮箱格式不正确 |
| NOT_CSUST_EMAIL | 不是长沙理工大学邮箱 |
| EMAIL_EXISTS | 邮箱已被注册 |
| EMAIL_NOT_FOUND | 邮箱未注册 |
| INVALID_CODE | 验证码错误或已过期 |
| CODE_SEND_TOO_FREQUENT | 验证码发送过于频繁 |
| WEAK_PASSWORD | 密码强度不足 |
| INVALID_CREDENTIALS | 邮箱或密码错误 |
| ACCOUNT_BANNED | 账号已被封禁 |
| ACCOUNT_INACTIVE | 账号未激活 |
| TOKEN_EXPIRED | Token已过期 |
| INVALID_TOKEN | 无效的Token |

### 匹配相关错误码

| 错误码 | 说明 |
|--------|------|
| MATCH_NOT_FOUND | 匹配记录不存在 |
| ALREADY_UNLOCKED | 已经解锁过了 |
| ALREADY_SKIPPED | 已经跳过了 |
| NO_CURRENT_MATCH | 当前没有匹配对象 |

### 配对相关错误码

| 错误码 | 说明 |
|--------|------|
| PAIRING_NOT_FOUND | 配对记录不存在 |
| PAIRING_ALREADY_ENDED | 配对已经结束 |
| NO_ACTIVE_PAIRING | 没有活跃的配对 |

### 问卷相关错误码

| 错误码 | 说明 |
|--------|------|
| QUESTIONNAIRE_NOT_COMPLETED | 问卷未完成 |
| INVALID_QUESTION_ID | 无效的问题ID |
| ANSWER_ALREADY_EXISTS | 答案已存在 |

### 匹配轮次相关错误码

| 错误码 | 说明 |
|--------|------|
| ROUND_NOT_FOUND | 匹配轮次不存在 |
| ROUND_NOT_ACTIVE | 匹配轮次未激活 |
| ALREADY_IN_ROUND | 已在当前轮次中 |

---

## 6. 问卷相关接口

### 6.1 获取问卷问题列表

获取所有问卷问题，支持按部分筛选。

**请求**

```http
GET /api/questionnaire/questions?section=appearance
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| section | string | 否 | 筛选部分：appearance/personality/values/interests/career/family/expectation/additional |

**响应示例**

```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "name": "appearance",
        "title": "外貌与生活方式",
        "weight": 0.15,
        "questions": [
          {
            "id": 1,
            "question_code": "Q1.1",
            "question_text": "你的身高是？",
            "question_type": "single",
            "options": {
              "A": "155cm以下",
              "B": "155-160cm",
              "C": "160-165cm",
              "D": "165-170cm",
              "E": "170-175cm",
              "F": "175-180cm",
              "G": "180-185cm",
              "H": "185cm以上"
            },
            "subsection": "身高相关"
          }
        ]
      }
    ],
    "total_questions": 80,
    "completed_questions": 45
  }
}
```

---

### 6.2 提交问卷答案

提交或更新问卷答案。

**请求**

```http
POST /api/questionnaire/answers
Authorization: Bearer <token>
```

**请求体**

```json
{
  "answers": [
    {
      "question_id": 1,
      "answer_value": "E"
    },
    {
      "question_id": 2,
      "answer_value": "C"
    },
    {
      "question_id": 11,
      "answer_value": ["A", "C", "E"]
    }
  ]
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| answers | array | 是 | 答案数组 |
| answers[].question_id | number | 是 | 问题ID |
| answers[].answer_value | string/array | 是 | 单选为字符串，多选为数组 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "saved_count": 3,
    "total_answered": 48,
    "total_questions": 80,
    "completeness": 60.0,
    "message": "答案保存成功"
  }
}
```

---

### 6.3 获取当前用户答案

获取当前用户已填写的所有问卷答案。

**请求**

```http
GET /api/questionnaire/answers
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "answers": {
      "Q1.1": "E",
      "Q1.2": "C",
      "Q1.4": "B",
      "Q4.1": ["A", "C", "E"]
    },
    "completeness": 60.0,
    "sections_completed": ["appearance", "personality"],
    "last_updated": "2024-04-09T10:00:00Z"
  }
}
```

---

### 6.4 获取问卷填写进度

获取问卷各部分的填写进度。

**请求**

```http
GET /api/questionnaire/progress
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "total_questions": 80,
    "answered_questions": 48,
    "completeness": 60.0,
    "sections": [
      {
        "name": "appearance",
        "title": "外貌与生活方式",
        "total": 15,
        "answered": 15,
        "completed": true
      },
      {
        "name": "personality",
        "title": "性格特征",
        "total": 11,
        "answered": 11,
        "completed": true
      },
      {
        "name": "values",
        "title": "价值观与恋爱观",
        "total": 15,
        "answered": 12,
        "completed": false
      },
      {
        "name": "interests",
        "title": "兴趣爱好",
        "total": 10,
        "answered": 5,
        "completed": false
      },
      {
        "name": "career",
        "title": "学业与规划",
        "total": 7,
        "answered": 3,
        "completed": false
      },
      {
        "name": "family",
        "title": "家庭与背景",
        "total": 8,
        "answered": 2,
        "completed": false
      },
      {
        "name": "expectation",
        "title": "期望偏好",
        "total": 9,
        "answered": 0,
        "completed": false
      },
      {
        "name": "additional",
        "title": "附加问题",
        "total": 5,
        "answered": 0,
        "completed": false
      }
    ],
    "can_match": false,
    "min_completeness_for_match": 50.0
  }
}
```

---

## 7. 匹配轮次相关接口

### 7.1 获取当前匹配轮次

获取当前进行中的匹配轮次信息。

**请求**

```http
GET /api/matches/rounds/current
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "round": {
      "id": 5,
      "round_number": 5,
      "year": 2024,
      "status": "running",
      "started_at": "2024-04-09T00:00:00Z",
      "total_users": 156,
      "matched_pairs": 78
    },
    "user_status": {
      "in_pool": true,
      "has_match": true,
      "match_id": 234
    }
  }
}
```

---

### 7.2 获取匹配轮次历史

获取历史匹配轮次列表。

**请求**

```http
GET /api/matches/rounds/history?page=1&limit=10
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "rounds": [
      {
        "id": 4,
        "round_number": 4,
        "year": 2024,
        "status": "completed",
        "started_at": "2024-04-02T00:00:00Z",
        "completed_at": "2024-04-02T01:30:00Z",
        "total_users": 142,
        "matched_pairs": 71
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "total_pages": 1
    }
  }
}
```

---

### 7.3 获取候选用户列表

获取当前轮次的候选用户列表（用于偏好排序）。

**请求**

```http
GET /api/matches/candidates?round=5
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "round_number": 5,
    "candidates": [
      {
        "id": 42,
        "name": "李四",
        "gender": "female",
        "college": "数学学院",
        "major": "应用数学",
        "grade": "大二",
        "bio": "喜欢数学和音乐",
        "compatibility_score": 85.5,
        "match_reasons": [
          "兴趣爱好高度相似",
          "价值观契合",
          "生活习惯互补"
        ]
      },
      {
        "id": 56,
        "name": "王五",
        "gender": "female",
        "college": "外语学院",
        "major": "英语",
        "grade": "大三",
        "bio": "热爱阅读和旅行",
        "compatibility_score": 78.3,
        "match_reasons": [
          "性格互补",
          "共同兴趣"
        ]
      }
    ],
    "total_candidates": 5
  }
}
```

---

### 7.4 获取用户偏好排序

获取当前用户对候选人的偏好排序列表。

**请求**

```http
GET /api/matches/rankings?round=5
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "round_number": 5,
    "rankings": [
      {
        "candidate_id": 42,
        "preference_rank": 1,
        "compatibility_score": 85.5
      },
      {
        "candidate_id": 56,
        "preference_rank": 2,
        "compatibility_score": 78.3
      }
    ],
    "is_finalized": false
  }
}
```

---

### 7.5 更新偏好排序

用户调整对候选人的偏好排序。

**请求**

```http
PUT /api/matches/rankings
Authorization: Bearer <token>
```

**请求体**

```json
{
  "round_number": 5,
  "rankings": [
    {"candidate_id": 42, "preference_rank": 1},
    {"candidate_id": 56, "preference_rank": 2},
    {"candidate_id": 78, "preference_rank": 3}
  ]
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "updated_count": 3,
    "message": "偏好排序更新成功"
  }
}
```

---

## 8. 向量与匹配分数接口

### 8.1 获取用户特征向量

获取当前用户的特征向量（用于调试）。

**请求**

```http
GET /api/vectors/my-vector
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "completeness": 85.0,
    "vectors": {
      "appearance": {
        "height": 4,
        "body_type": 3,
        "lifestyle": 3.5
      },
      "personality": {
        "extroversion": 3,
        "communication": 4,
        "independence": 3
      },
      "values": {
        "life_goal": 4,
        "relationship_view": 3.5,
        "money_attitude": 3
      }
    },
    "dimension_scores": {
      "appearance": 3.5,
      "personality": 3.3,
      "values": 3.5,
      "interests": 4.0,
      "career": 3.0,
      "family": 2.5,
      "expectation": 3.0
    },
    "updated_at": "2024-04-09T10:00:00Z"
  }
}
```

---

### 8.2 计算匹配分数

计算与指定用户的匹配分数（用于调试）。

**请求**

```http
POST /api/vectors/calculate-match
Authorization: Bearer <token>
```

**请求体**

```json
{
  "target_user_id": 42
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "target_user_id": 42,
    "compatibility_score": 85.5,
    "dimension_scores": {
      "appearance": 90.0,
      "personality": 85.0,
      "values": 88.0,
      "interests": 82.0,
      "career": 75.0,
      "family": 70.0,
      "expectation": 80.0
    },
    "match_details": {
      "shared_interests": ["音乐", "运动", "阅读"],
      "compatible_habits": ["作息时间", "运动频率"],
      "value_alignment": ["恋爱观", "金钱态度"]
    }
  }
}
```

---

## 请求示例

### JavaScript (Axios)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://datedrop.csust.edu.cn/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api
```

### 使用示例

```javascript
import api from './api'

const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    return res.data.user
  } catch (error) {
    throw error
  }
}

const getProfile = async () => {
  const res = await api.get('/users/profile')
  return res.data
}

const updateProfile = async (data) => {
  const res = await api.put('/users/profile', data)
  return res.data
}

const getCurrentMatch = async () => {
  const res = await api.get('/matches/current')
  return res.data
}

const unlockMatch = async (matchId) => {
  const res = await api.post(`/matches/${matchId}/unlock`)
  return res.data
}

const skipMatch = async (matchId) => {
  const res = await api.post(`/matches/${matchId}/skip`)
  return res.data
}
```

---

## 测试接口

### 使用 cURL

```bash
curl -X POST https://datedrop.csust.edu.cn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@csust.edu.cn","password":"Password123"}'
```

### 使用 Postman

1. 导入环境变量：
   - `base_url`: `https://datedrop.csust.edu.cn/api`
   - `token`: 登录后获取的JWT

2. 设置请求头：
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer {{token}}`

---

## 版本控制

API 使用 URL 路径进行版本控制，当前版本为 v1。

未来如有破坏性更新，将发布新版本 API：
- `/api/v2/...`
- 旧版本 API 将继续维护一段时间

---

## 更新日志

### v1.0.0 (2024-04-08)
- 初始版本发布
- 实现用户认证功能
- 实现匹配系统
- 实现配对管理
