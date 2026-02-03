# ?? Submission System Schema Guide

This document describes the **Submission Architecture** used across all modules  
(e.g. Travel Request, Petty Cash, Vehicle Request, etc.).

The goal is to:
- Support many modules with different fields
- Allow global dashboards, counts, and search
- Keep data scalable and clean
- Avoid mega-tables or duplicated logic

---

## ?? Core Concept

We use a **Header + Detail (Master / Detail)** pattern.

- `submitted_requests` ? universal **header** (one per submission)
- `<module>_submissions` ? module-specific **detail** table (1:1)

Every submission:
- Exists exactly once in `submitted_requests`
- Has exactly one detail record in its module table

---

## ??? Tables Overview

### 1?? `modules`
Defines all system modules.

| Column | Type | Notes |
|------|----|----|
| id | bigint | Primary key |
| name | varchar | Module name |
| description | varchar | Optional |
| icon | varchar | Icon key or path |
| is_active | boolean | Enabled / disabled |
| created_by | bigint | FK ? users.id |
| created_at | datetime | |
| updated_at | datetime | |

---

### 2?? `submitted_requests` (HEADER TABLE)

**One row per submission across all modules**

| Column | Type | Notes |
|------|----|----|
| id | bigint | Primary key |
| module_id | bigint | FK ? modules.id |
| created_by | bigint | FK ? users.id |
| status | varchar | draft / submitted / cancelled / etc |
| title | varchar | Optional display title |
| reference_no | varchar | Optional (PC-2026-000123) |
| created_at | datetime | |
| updated_at | datetime | |

#### Recommended Indexes

```sql
INDEX (created_by, created_at)
INDEX (module_id, created_at)
INDEX (status, created_at)
```

---

## ?? Module Detail Tables (1 per module)

Each module has its own detail table with a strict 1:1 link to
`submitted_requests`.

### Example: `travel_request_submissions`

| Column | Type | Notes |
|------|----|----|
| id | bigint | Primary key |
| submitted_request_id | bigint | FK ? submitted_requests.id |
| destination | varchar | |
| start_date | date | |
| end_date | date | |
| purpose | text | |
| estimated_cost | decimal | |
| created_at | datetime | |
| updated_at | datetime | |

```sql
UNIQUE (submitted_request_id)
```

### Example: `petty_cash_submissions`

| Column | Type | Notes |
|------|----|----|
| id | bigint | Primary key |
| submitted_request_id | bigint | FK ? submitted_requests.id |
| amount | decimal | |
| expense_date | date | |
| description | text | |
| receipt_path | varchar | |
| created_at | datetime | |
| updated_at | datetime | |

```sql
UNIQUE (submitted_request_id)
```

---

## ?? Relationships (Laravel)

### SubmittedRequest Model

```php
class SubmittedRequest extends Model
{
    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

### Module Detail Model (Example)

```php
class TravelRequestSubmission extends Model
{
    public function submittedRequest()
    {
        return $this->belongsTo(SubmittedRequest::class);
    }
}
```

---

## ?? Creating a Submission (Flow)

Always create header + detail inside one transaction.

1. Start DB transaction
2. Insert row into `submitted_requests`
3. Insert row into `<module>_submissions` using `submitted_request_id`
4. Commit transaction

? Header and detail must never exist independently.

---

## ?? Common Use Cases

### Get all submissions by user

```sql
SELECT *
FROM submitted_requests
WHERE created_by = ?
ORDER BY created_at DESC;
```

### Count submissions per module

```sql
SELECT module_id, COUNT(*)
FROM submitted_requests
WHERE created_by = ?
GROUP BY module_id;
```

### Open a specific submission

1. Load row from `submitted_requests`
2. Read `module_id`
3. Query the corresponding `<module>_submissions` table

---

## ?? Where Status Lives

- Global lifecycle status (draft / submitted / cancelled / etc)  
  ? `submitted_requests.status`
- Module-specific sub-status (if needed)  
  ? module detail table

---

## ?? Approvals (Future Integration)

When approvals are added:

- `approvals.submitted_request_id` ? FK ? `submitted_requests.id`
- Approvals do **NOT** reference module tables directly

Why:

- one global approval system
- no module branching logic
- clean foreign keys

---

## ? Performance Notes

- `submitted_requests` is intentionally lightweight
- Always paginate list endpoints
- Avoid auto-joining detail tables for list views
- Index based on actual query patterns

This schema scales well into millions of rows with proper indexing.

---

## ? Why This Design Works

- ? Clean separation of concerns
- ? Easy dashboards and analytics
- ? No mega-tables full of nulls
- ? New modules plug in cleanly
- ? Works naturally with REST APIs

---

## ?? Golden Rule

`submitted_requests` answers **"WHAT happened"**.  
Module tables answer **"DETAILS of what happened"**.

Use this principle whenever adding a new module.

---

If you want next, I can:

- turn this into **migration order**
- create a **"How to add a new module" checklist**
- design **REST endpoints** that sit perfectly on top of this
- or review your existing migrations and map them to this schema

This is a **solid architecture**, bro ??
