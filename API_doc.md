# API Documentation

This document describes all backend API endpoints for frontend integration (React.js, TypeScript). All request and response fields are fully explicit, with types and notes for each field.

---

## Auth Endpoints

### 1. Register

**POST** `/api/v1/auth/register`

**Description:** Register a new user.

#### Request
```json
{
  "email": "user@example.com",
  "password": "stringpassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "referral_code": "ABCDEFGH",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

| Field           | Type    | Enum/Notes                        | Nullable | Description                        |
|-----------------|---------|-----------------------------------|----------|------------------------------------|
| email           | string  | valid email                       | no       | User email                         |
| password        | string  | min 6 chars                       | no       | User password                      |
| first_name      | string  | 2-50 chars                        | no       | First name                         |
| last_name       | string  | 2-50 chars                        | no       | Last name                          |
| phone           | string  | valid phone                       | yes      | Phone number                       |
| referral_code   | string  | 8-10 chars                        | yes      | Referral code                      |
| wallet_address  | string  | Ethereum address                  | yes      | Wallet address                     |

#### Response (Success)
```json
{
  "id": 2,
  "email": "user@example.com",
  "username": "user123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "status": "pending_verification",
  "referralCode": "ABCDEFGH",
  "referredBy": 1,
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "createdAt": "2024-06-01T12:34:56.000Z",
  "updatedAt": "2024-06-01T12:34:56.000Z"
}
```

| Field           | Type    | Enum/Notes                        | Nullable | Description                        |
|-----------------|---------|-----------------------------------|----------|------------------------------------|
| id              | integer |                                   | no       | User ID                            |
| email           | string  |                                   | no       | User email                         |
| username        | string  |                                   | no       | Username (system-generated)        |
| first_name      | string  |                                   | no       | First name                         |
| last_name       | string  |                                   | no       | Last name                          |
| phone           | string  |                                   | yes      | Phone number                       |
| role            | string  | "user", "admin"                   | no       | User role                          |
| status          | string  | "pending_verification"            | no       | Account status                     |
| referralCode    | string  |                                   | no       | User's referral code               |
| referredBy      | integer |                                   | yes      | Referrer's user ID                 |
| wallet_address  | string  | Ethereum address                  | yes      | Wallet address                     |
| createdAt       | string  | ISO 8601 datetime                 | no       | User creation timestamp            |
| updatedAt       | string  | ISO 8601 datetime                 | no       | User update timestamp              |

---

### 2. Login

**POST** `/api/v1/auth/login`

**Description:** Log in with email and password.

#### Request
```json
{
  "email": "user@example.com",
  "password": "stringpassword"
}
```

| Field    | Type   | Enum/Notes   | Nullable | Description      |
|----------|--------|--------------|----------|------------------|
| email    | string | valid email  | no       | User email       |
| password | string |              | no       | User password    |

#### Response (Success)
```json
{
  "accessToken": "jwt.token.here",
  "refreshToken": "jwt.refresh.token.here",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "username": "user123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "user",
    "status": "active",
    "referralCode": "ABCDEFGH",
    "referredBy": 1,
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "createdAt": "2024-06-01T12:34:56.000Z",
    "updatedAt": "2024-06-01T12:34:56.000Z"
  }
}
```

| Field                | Type    | Enum/Notes         | Nullable | Description                        |
|----------------------|---------|--------------------|----------|------------------------------------|
| accessToken          | string  | JWT                | no       | Access token                       |
| refreshToken         | string  | JWT                | no       | Refresh token                      |
| user                 | object  |                    | no       | User object                        |
| user.id              | integer |                    | no       | User ID                            |
| user.email           | string  |                    | no       | User email                         |
| user.username        | string  |                    | no       | Username                           |
| user.first_name      | string  |                    | no       | First name                         |
| user.last_name       | string  |                    | no       | Last name                          |
| user.phone           | string  |                    | yes      | Phone number                       |
| user.role            | string  | "user", "admin"    | no       | User role                          |
| user.status          | string  | "active", ...      | no       | Account status                     |
| user.referralCode    | string  |                    | no       | User's referral code               |
| user.referredBy      | integer |                    | yes      | Referrer's user ID                 |
| user.wallet_address  | string  | Ethereum address   | yes      | Wallet address                     |
| user.createdAt       | string  | ISO 8601 datetime  | no       | User creation timestamp            |
| user.updatedAt       | string  | ISO 8601 datetime  | no       | User update timestamp              |

---

## Users Endpoints

### 1. Get My Profile

**GET** `/api/v1/users/profile`

**Description:** Retrieve the authenticated user's profile.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:**
  _None_

#### Response
```json
{
  "id": 2,
  "email": "user@example.com",
  "username": "user123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "status": "active",
  "referralCode": "ABCDEFGH",
  "referredBy": 1,
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "country": "USA",
  "city": "New York",
  "timezone": "UTC",
  "language": "en",
  "createdAt": "2024-05-30T10:00:00.000Z",
  "updatedAt": "2024-06-01T12:34:56.000Z"
}
```

| Field         | Type    | Enum/Notes                        | Nullable | Description                        |
|---------------|---------|-----------------------------------|----------|------------------------------------|
| id            | integer |                                   | no       | User ID                            |
| email         | string  |                                   | no       | User email                         |
| username      | string  |                                   | no       | Username                           |
| first_name    | string  |                                   | no       | First name                         |
| last_name     | string  |                                   | no       | Last name                          |
| phone         | string  |                                   | yes      | Phone number                       |
| role          | string  | "user", "admin"                  | no       | User role                          |
| status        | string  | "active", "inactive", "banned"   | no       | Account status                     |
| referralCode  | string  |                                   | no       | User's referral code               |
| referredBy    | integer |                                   | yes      | Referrer's user ID                 |
| wallet_address| string  | Ethereum address                  | yes      | Wallet address                     |
| country       | string  |                                   | yes      | Country                            |
| city          | string  |                                   | yes      | City                               |
| timezone      | string  | See below                         | yes      | Timezone                           |
| language      | string  | See below                         | yes      | Language                           |
| createdAt     | string  | ISO 8601 datetime                 | no       | User creation timestamp            |
| updatedAt     | string  | ISO 8601 datetime                 | no       | User update timestamp              |

- **timezone**: "UTC", "EST", "PST", "CST", "MST", "GMT", "CET", "JST", "AEST"
- **language**: "en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh"

---

### 2. Update My Profile

**PUT** `/api/v1/users/profile`

**Description:** Update the authenticated user's profile.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1987654321",
  "country": "Canada",
  "city": "Toronto",
  "timezone": "EST",
  "language": "fr"
}
```

| Field      | Type    | Enum/Notes                        | Nullable | Description                        |
|------------|---------|-----------------------------------|----------|------------------------------------|
| first_name | string  | 2-50 chars                        | yes      | First name                         |
| last_name  | string  | 2-50 chars                        | yes      | Last name                          |
| phone      | string  | valid phone                       | yes      | Phone number                       |
| country    | string  | 2-100 chars                       | yes      | Country                            |
| city       | string  | 2-100 chars                       | yes      | City                               |
| timezone   | string  | See above                         | yes      | Timezone                           |
| language   | string  | See above                         | yes      | Language                           |

#### Response
```json
{
  "id": 2,
  "email": "user@example.com",
  "username": "user123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1987654321",
  "role": "user",
  "status": "active",
  "referralCode": "ABCDEFGH",
  "referredBy": 1,
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "country": "Canada",
  "city": "Toronto",
  "timezone": "EST",
  "language": "fr",
  "createdAt": "2024-05-30T10:00:00.000Z",
  "updatedAt": "2024-06-02T09:00:00.000Z"
}
```

| Field         | Type    | Enum/Notes                        | Nullable | Description                        |
|---------------|---------|-----------------------------------|----------|------------------------------------|
| id            | integer |                                   | no       | User ID                            |
| email         | string  |                                   | no       | User email                         |
| username      | string  |                                   | no       | Username                           |
| first_name    | string  |                                   | no       | First name                         |
| last_name     | string  |                                   | no       | Last name                          |
| phone         | string  |                                   | yes      | Phone number                       |
| role          | string  | "user", "admin"                  | no       | User role                          |
| status        | string  | "active", "inactive", "banned"   | no       | Account status                     |
| referralCode  | string  |                                   | no       | User's referral code               |
| referredBy    | integer |                                   | yes      | Referrer's user ID                 |
| wallet_address| string  | Ethereum address                  | yes      | Wallet address                     |
| country       | string  |                                   | yes      | Country                            |
| city          | string  |                                   | yes      | City                               |
| timezone      | string  | See above                         | yes      | Timezone                           |
| language      | string  | See above                         | yes      | Language                           |
| createdAt     | string  | ISO 8601 datetime                 | no       | User creation timestamp            |
| updatedAt     | string  | ISO 8601 datetime                 | no       | User update timestamp              |

---

## Staking Endpoints

### 1. Get All Staking Packages

**GET** `/api/v1/staking/packages`

**Description:** Retrieve all available staking packages.

#### Request
- **Headers:** None
- **Body:** None

#### Response
```json
{
  "packages": [
    {
      "id": 1,
      "name": "Basic Package",
      "description": "Stake and earn daily rewards.",
      "stake_amount": "100.00",
      "daily_yield_percentage": "0.5",
      "lock_period_days": 30,
      "min_stake_amount": "50.00",
      "max_stake_amount": "1000.00",
      "is_promotional": false,
      "promotional_expires_at": null,
      "max_participants": null,
      "sort_order": 1,
      "createdAt": "2024-05-01T00:00:00.000Z",
      "updatedAt": "2024-05-01T00:00:00.000Z"
    }
  ]
}
```

| Field                        | Type      | Enum/Notes                | Nullable | Description                       |
|------------------------------|-----------|---------------------------|----------|-----------------------------------|
| packages                     | array     |                           | no       | List of staking package objects   |
| packages[].id                | integer   |                           | no       | Package ID                        |
| packages[].name              | string    |                           | no       | Package name                      |
| packages[].description       | string    |                           | yes      | Description                       |
| packages[].stake_amount      | string    | decimal, as string        | no       | Stake amount required             |
| packages[].daily_yield_percentage | string| decimal, as string        | no       | Daily yield percentage            |
| packages[].lock_period_days  | integer   |                           | yes      | Lock period in days               |
| packages[].min_stake_amount  | string    | decimal, as string        | no       | Minimum stake amount              |
| packages[].max_stake_amount  | string    | decimal, as string        | yes      | Maximum stake amount              |
| packages[].is_promotional    | boolean   |                           | no       | Is promotional package            |
| packages[].promotional_expires_at | string| ISO 8601 datetime         | yes      | Promotional expiry date           |
| packages[].max_participants  | integer   |                           | yes      | Max participants                  |
| packages[].sort_order        | integer   |                           | yes      | Sort order                        |
| packages[].createdAt         | string    | ISO 8601 datetime         | no       | Creation timestamp                |
| packages[].updatedAt         | string    | ISO 8601 datetime         | no       | Update timestamp                  |

---

### 2. Get Staking Package Details

**GET** `/api/v1/staking/packages/:id`

**Description:** Retrieve details of a specific staking package by ID.

#### Request
- **Headers:** None
- **Body:** None
- **Path Parameter:**
  - `id`: integer, required, package ID

#### Response
```json
{
  "id": 1,
  "name": "Basic Package",
  "description": "Stake and earn daily rewards.",
  "stake_amount": "100.00",
  "daily_yield_percentage": "0.5",
  "lock_period_days": 30,
  "min_stake_amount": "50.00",
  "max_stake_amount": "1000.00",
  "is_promotional": false,
  "promotional_expires_at": null,
  "max_participants": null,
  "sort_order": 1,
  "createdAt": "2024-05-01T00:00:00.000Z",
  "updatedAt": "2024-05-01T00:00:00.000Z"
}
```

| Field                        | Type      | Enum/Notes                | Nullable | Description                       |
|------------------------------|-----------|---------------------------|----------|-----------------------------------|
| id                           | integer   |                           | no       | Package ID                        |
| name                         | string    |                           | no       | Package name                      |
| description                  | string    |                           | yes      | Description                       |
| stake_amount                 | string    | decimal, as string        | no       | Stake amount required             |
| daily_yield_percentage       | string    | decimal, as string        | no       | Daily yield percentage            |
| lock_period_days             | integer   |                           | yes      | Lock period in days               |
| min_stake_amount             | string    | decimal, as string        | no       | Minimum stake amount              |
| max_stake_amount             | string    | decimal, as string        | yes      | Maximum stake amount              |
| is_promotional               | boolean   |                           | no       | Is promotional package            |
| promotional_expires_at       | string    | ISO 8601 datetime         | yes      | Promotional expiry date           |
| max_participants             | integer   |                           | yes      | Max participants                  |
| sort_order                   | integer   |                           | yes      | Sort order                        |
| createdAt                    | string    | ISO 8601 datetime         | no       | Creation timestamp                |
| updatedAt                    | string    | ISO 8601 datetime         | no       | Update timestamp                  |

---

## Payments Endpoints

### 1. Generate Payment Address

**POST** `/api/v1/payments/generate-address`

**Description:** Generate a payment address for a deposit.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:**
```json
{
  "amount": "100.00"
}
```

| Field   | Type   | Enum/Notes         | Nullable | Description         |
|---------|--------|--------------------|----------|---------------------|
| amount  | string | decimal, as string | no       | Deposit amount      |

#### Response
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "network": "BEP20",
  "amount": "100.00",
  "expiresAt": "2024-06-10T12:00:00.000Z"
}
```

| Field      | Type   | Enum/Notes         | Nullable | Description                |
|------------|--------|--------------------|----------|----------------------------|
| address    | string | Ethereum address   | no       | Payment address            |
| network    | string | "BEP20"            | no       | Network type               |
| amount     | string | decimal, as string | no       | Deposit amount             |
| expiresAt  | string | ISO 8601 datetime  | no       | Expiry timestamp           |

---

### 2. Convert Tokens

**POST** `/api/v1/payments/convert-tokens`

**Description:** Convert EGD tokens to USDT.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:**
```json
{
  "amount": "50.00"
}
```

| Field   | Type   | Enum/Notes         | Nullable | Description         |
|---------|--------|--------------------|----------|---------------------|
| amount  | string | decimal, as string | no       | Amount to convert   |

#### Response
```json
{
  "convertedAmount": "48.50",
  "rate": "0.97",
  "currency": "USDT"
}
```

| Field           | Type   | Enum/Notes         | Nullable | Description                |
|-----------------|--------|--------------------|----------|----------------------------|
| convertedAmount | string | decimal, as string | no       | Amount after conversion    |
| rate            | string | decimal, as string | no       | Conversion rate            |
| currency        | string | "USDT"             | no       | Target currency            |

---

## Referrals Endpoints

### 1. Get My Referral Link

**GET** `/api/v1/referrals/my-referral-link`

**Description:** Retrieve the authenticated user's referral link.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:** None

#### Response
```json
{
  "referralLink": "https://app.example.com/register?ref=ABCDEFGH"
}
```

| Field        | Type   | Enum/Notes | Nullable | Description                |
|--------------|--------|------------|----------|----------------------------|
| referralLink | string | URL        | no       | User's referral link       |

---

### 2. Get My Referrals

**GET** `/api/v1/referrals/my-referrals`

**Description:** Get the list of users referred by the authenticated user.

#### Request
- **Headers:**
  - `Authorization`: `Bearer <JWT>`
- **Body:** None

#### Response
```json
{
  "referrals": [
    {
      "id": 3,
      "referrerId": 1,
      "referredId": 5,
      "level": 1,
      "createdAt": "2024-06-01T12:34:56.000Z",
      "updatedAt": "2024-06-01T12:34:56.000Z",
      "referredUser": {
        "id": 5,
        "email": "referreduser@example.com",
        "username": "referreduser",
        "first_name": "Referred",
        "last_name": "User",
        "phone": "+1234567890",
        "role": "user",
        "status": "active",
        "createdAt": "2024-05-30T10:00:00.000Z",
        "updatedAt": "2024-06-01T12:34:56.000Z"
      }
    }
  ]
}
```

| Field                        | Type      | Enum/Notes                                 | Nullable | Description                                 |
|------------------------------|-----------|--------------------------------------------|----------|---------------------------------------------|
| referrals                    | array     |                                            | no       | List of referral objects                    |
| referrals[].id               | integer   |                                            | no       | Referral record ID                          |
| referrals[].referrerId       | integer   |                                            | no       | User ID of the referrer                     |
| referrals[].referredId       | integer   |                                            | no       | User ID of the referred user                |
| referrals[].level            | integer   | 1, 2, 3, ...                               | no       | Referral level (1 = direct, etc.)           |
| referrals[].createdAt        | string    | ISO 8601 datetime                          | no       | Referral creation timestamp                 |
| referrals[].updatedAt        | string    | ISO 8601 datetime                          | no       | Referral update timestamp                   |
| referrals[].referredUser     | object    |                                            | no       | The referred user object                    |
| referredUser.id              | integer   |                                            | no       | User ID                                     |
| referredUser.email           | string    |                                            | no       | User email                                  |
| referredUser.username        | string    |                                            | no       | Username                                    |
| referredUser.first_name      | string    |                                            | no       | First name                                  |
| referredUser.last_name       | string    |                                            | no       | Last name                                   |
| referredUser.phone           | string    |                                            | yes      | Phone number                                |
| referredUser.role            | string    | "user", "admin"                            | no       | User role                                   |
| referredUser.status          | string    | "active", "inactive", "banned"             | no       | Account status                              |
| referredUser.createdAt       | string    | ISO 8601 datetime                          | no       | User creation timestamp                     |
| referredUser.updatedAt       | string    | ISO 8601 datetime                          | no       | User update timestamp                       |

---

(Documentation will continue for all endpoints in this style, covering all Referrals, Admin, and Health routes, with explicit request/response and type tables for every field.) 