# Study Tools Server API

基于 Koa 的学习工具后端服务，提供图片生成、用户管理、积分系统等功能。

## 基础信息

- **基础路径**: `http://localhost:3000/api/v1`
- **认证方式**: JWT Token（登录接口返回，放在请求头 `Authorization: Bearer <token>`）

---

## 目录

1. [基础路由](#1-基础路由)
2. [认证模块](#2-认证模块)
3. [用户模块](#3-用户模块)
4. [图片生成模块](#4-图片生成模块)
5. [积分/签到/充值模块](#5-积分签到充值模块)
6. [业务公开接口](#6-业务公开接口)
7. [管理后台接口](#7-管理后台接口)

---

## 1. 基础路由

| 方法 | 路径      | 描述     | 是否需登录 |
| ---- | --------- | -------- | ---------- |
| GET  | `/health` | 健康检查 | 否         |

### 1.1 健康检查

**GET** `/api/v1/health`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok",
    "timestamp": 1700000000000
  }
}
```

---

## 2. 认证模块

### 2.1 微信小程序登录

**POST** `/api/v1/auth/login`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | 是 | 微信小程序登录 code |

**响应示例**:

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "avatarUrl": "https://..."
    },
    "isNewUser": false
  }
}
```

---

## 3. 用户模块

> 所有接口需登录，请求头携带 `Authorization: Bearer <token>`

### 3.1 获取用户信息+积分余额

**GET** `/api/v1/user/profile`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "用户昵称",
    "avatarUrl": "https://...",
    "phone": "138****8888",
    "points": 100
  }
}
```

### 3.2 更新用户信息

**PUT** `/api/v1/user/profile`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatarUrl | string | 否 | 头像URL |

### 3.3 绑定手机号

**POST** `/api/v1/user/phone`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| phone | string | 是 | 手机号 |

---

## 4. 图片生成模块

### 4.1 获取支持的图片生成类型

**GET** `/api/v1/image/types`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "type": "cartoon",
      "description": "卡通风格",
      "defaultPrompt": "可爱的卡通人物"
    }
  ]
}
```

### 4.2 一站式生成图片

> 提交+轮询+返回，适合前端等待的场景

**POST** `/api/v1/image/generate`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| type | string | 是 | 图片类型 |
| prompt | string | 否 | 用户自定义提示词 |
| options | object | 否 | 额外参数 |

**响应示例**:

```json
{
  "code": 0,
  "message": "图片生成成功",
  "data": {
    "recordId": 1,
    "previewUrls": ["https://qiniu.example.com/xxx.jpg"]
  }
}
```

### 4.3 提交图片生成任务（异步）

**POST** `/api/v1/image/submit`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| type | string | 是 | 图片类型 |
| prompt | string | 否 | 用户自定义提示词 |
| options | object | 否 | 额外参数 |

**响应示例**:

```json
{
  "code": 0,
  "message": "任务提交成功",
  "data": {
    "taskId": "abc123",
    "recordId": 1
  }
}
```

### 4.4 查询任务结果（单次）

**GET** `/api/v1/image/result/:taskId`

**路径参数**:
| 字段 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

### 4.5 轮询等待任务结果（阻塞式）

**GET** `/api/v1/image/poll/:taskId?maxRetries=30&interval=2000`

**路径参数**:
| 字段 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

**查询参数**:
| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| maxRetries | number | 30 | 最大重试次数 |
| interval | number | 2000 | 轮询间隔（毫秒） |

### 4.6 查询图片生成记录列表

**GET** `/api/v1/image/records?type=xxx&page=1&pageSize=20`

**查询参数**:
| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| type | string | - | 筛选类型 |
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页数量 |

### 4.7 获取单条图片生成记录

**GET** `/api/v1/image/records/:id`

---

## 5. 积分/签到/充值模块

> 所有接口需登录

### 5.1 积分相关

#### 5.1.1 查询积分余额

**GET** `/api/v1/point/balance`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 100,
    "totalEarned": 200,
    "totalSpent": 100
  }
}
```

#### 5.1.2 积分变更记录

**GET** `/api/v1/point/logs?page=1&pageSize=20`

---

### 5.2 签到相关

#### 5.2.1 签到

**POST** `/api/v1/point/signin`

**响应示例**:

```json
{
  "code": 0,
  "message": "签到成功，获得10积分",
  "data": {
    "continuousDays": 5,
    "rewardPoints": 10
  }
}
```

#### 5.2.2 获取签到状态

**GET** `/api/v1/point/signin/status`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "todaySigned": true,
    "continuousDays": 5
  }
}
```

#### 5.2.3 获取签到奖励配置

**GET** `/api/v1/point/signin/config`

---

### 5.3 充值相关

#### 5.3.1 获取充值套餐列表

**GET** `/api/v1/point/recharge/packages`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "100积分",
      "points": 100,
      "bonus": 0,
      "amount": 9.9
    }
  ]
}
```

#### 5.3.2 创建充值订单

**POST** `/api/v1/point/recharge/create`

**请求体**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| packageId | number | 是 | 套餐ID |

#### 5.3.3 获取充值记录

**GET** `/api/v1/point/recharge/orders?page=1&pageSize=20`

---

## 6. 业务公开接口

> 无需登录，供C端公开访问

### 6.1 获取轮播图列表

**GET** `/api/v1/business/banners`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "活动banner",
      "imageUrl": "https://...",
      "linkType": "product",
      "linkUrl": "/product/1"
    }
  ]
}
```

### 6.2 获取分类列表

**GET** `/api/v1/business/categories?withProducts=1`

**查询参数**:
| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| withProducts | string | - | 是否包含产品列表（传1则包含） |

### 6.3 获取产品列表

**GET** `/api/v1/business/products?categoryId=1`

**查询参数**:
| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| categoryId | number | - | 分类ID筛选 |

### 6.4 获取单个产品详情

**GET** `/api/v1/business/products/:id`

---

## 7. 管理后台接口

> 基础路径: `/api/v1/admin`

### 7.1 充值套餐管理

| 方法   | 路径                           | 描述          |
| ------ | ------------------------------ | ------------- |
| GET    | `/recharge-package`            | 获取所有套餐  |
| GET    | `/recharge-package/:id`        | 获取单个套餐  |
| POST   | `/recharge-package`            | 创建套餐      |
| PUT    | `/recharge-package/:id`        | 更新套餐      |
| DELETE | `/recharge-package/:id`        | 删除套餐      |
| PATCH  | `/recharge-package/:id/toggle` | 切换启用/禁用 |

### 7.2 用户管理

| 方法   | 路径                      | 描述                  |
| ------ | ------------------------- | --------------------- |
| GET    | `/user`                   | 用户列表（分页+搜索） |
| GET    | `/user/:id`               | 用户详情              |
| PUT    | `/user/:id`               | 更新用户信息          |
| POST   | `/user/:id/adjust-points` | 调整积分              |
| DELETE | `/user/:id`               | 删除用户              |

### 7.3 图片记录管理

| 方法   | 路径                | 描述         |
| ------ | ------------------- | ------------ |
| GET    | `/image-record`     | 图片记录列表 |
| GET    | `/image-record/:id` | 图片记录详情 |
| DELETE | `/image-record/:id` | 删除图片记录 |

### 7.4 积分记录管理

| 方法 | 路径         | 描述         |
| ---- | ------------ | ------------ |
| GET  | `/point-log` | 积分记录列表 |

### 7.5 签到配置管理

| 方法   | 路径                 | 描述         |
| ------ | -------------------- | ------------ |
| GET    | `/signin-config`     | 签到配置列表 |
| POST   | `/signin-config`     | 创建签到配置 |
| PUT    | `/signin-config/:id` | 更新签到配置 |
| DELETE | `/signin-config/:id` | 删除签到配置 |

### 7.6 签到记录管理

| 方法   | 路径                 | 描述         |
| ------ | -------------------- | ------------ |
| GET    | `/signin-record`     | 签到记录列表 |
| DELETE | `/signin-record/:id` | 删除签到记录 |

### 7.7 充值订单管理

| 方法  | 路径                         | 描述         |
| ----- | ---------------------------- | ------------ |
| GET   | `/recharge-order`            | 充值订单列表 |
| GET   | `/recharge-order/:id`        | 订单详情     |
| PATCH | `/recharge-order/:id/pay`    | 标记已支付   |
| PATCH | `/recharge-order/:id/refund` | 退款         |

### 7.8 轮播图管理

| 方法   | 路径                 | 描述           |
| ------ | -------------------- | -------------- |
| GET    | `/banner`            | 获取所有轮播图 |
| GET    | `/banner/:id`        | 获取单个轮播图 |
| POST   | `/banner`            | 创建轮播图     |
| PUT    | `/banner/:id`        | 更新轮播图     |
| DELETE | `/banner/:id`        | 删除轮播图     |
| PATCH  | `/banner/:id/toggle` | 切换启用/禁用  |

### 7.9 分类管理

| 方法   | 路径                   | 描述          |
| ------ | ---------------------- | ------------- |
| GET    | `/category`            | 获取所有分类  |
| GET    | `/category/:id`        | 获取单个分类  |
| POST   | `/category`            | 创建分类      |
| PUT    | `/category/:id`        | 更新分类      |
| DELETE | `/category/:id`        | 删除分类      |
| PATCH  | `/category/:id/toggle` | 切换启用/禁用 |

### 7.10 产品管理

| 方法   | 路径                  | 描述          |
| ------ | --------------------- | ------------- |
| GET    | `/product`            | 获取所有产品  |
| GET    | `/product/:id`        | 获取单个产品  |
| POST   | `/product`            | 创建产品      |
| PUT    | `/product/:id`        | 更新产品      |
| DELETE | `/product/:id`        | 删除产品      |
| PATCH  | `/product/:id/toggle` | 切换启用/禁用 |

---

## 响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": -1,
  "message": "错误描述",
  "data": null
}
```

---

## 积分类型说明

| 类型         | 描述         |
| ------------ | ------------ |
| generate     | 生成图片消耗 |
| signin       | 签到获得     |
| recharge     | 充值获得     |
| admin_adjust | 管理员调整   |
| other        | 其他         |
