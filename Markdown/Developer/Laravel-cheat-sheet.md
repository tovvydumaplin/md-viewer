# Laravel Eloquent & Architecture Cheat Sheet

## Relationship Basics (Most Important)

### belongsTo()

Foreign key is in the **current** model.

```php
public function country()
{
    return $this->belongsTo(Country::class);
}
```

- Table has `country_id`
- Many current models -> one related model
- Memory rule: `belongsTo` = I own the foreign key

### hasMany()

Foreign key is in the **other** model.

```php
public function users()
{
    return $this->hasMany(User::class);
}
```

- Other table has `company_id`
- One current model -> many related models

### hasOne()

Like `hasMany`, but only one record.

```php
public function profile()
{
    return $this->hasOne(UserProfile::class);
}
```

- Other table has `user_id`

### belongsToMany() (Pivot Table)

Many-to-many relationship.

```php
public function roles()
{
    return $this->belongsToMany(Role::class);
}
```

- Pivot table: `role_user`
- Columns: `user_id`, `role_id`

## Relationship Memory Trick

- `belongsTo` -> I have the FK
- `hasOne` / `hasMany` -> the other table has the FK
- `belongsToMany` -> pivot table exists

## When to Add Relationship Methods

Add relationship methods **only if**:

- You add a foreign key
- You want eager loading
- You want `$model->relation->field`

No FK = no relationship method.

## Service Layer Cheat Sheet

A Service is:

- A class
- With multiple methods
- Grouped by domain, not table

```php
class UserService
{
    public function createUser(array $data) {}
    public function updateUser(int $id, array $data) {}
    public function suspendUser(int $id) {}
}
```

Use a Service when:

- Multiple tables involved
- Business rules exist
- Transactions needed
- Logic reused elsewhere (jobs, commands)

Skip Service when:

- Single table
- Simple CRUD
- No business rules

## Business Rules (Not Validation Rules)

Business rules = domain logic that is true regardless of UI or framework.

Examples:

- A suspended user cannot login
- A user must always have a profile
- You cannot delete a company with active users
- Changing department clears position

Business rules usually live in Services or Policies.

## Form Request Cheat Sheet

Form Requests:

- Validate input
- Keep controllers clean

Use Form Requests when:

- POST / PUT / PATCH
- More than 2-3 rules
- Unique or conditional validation

Skip Form Requests when:

- GET-only endpoints
- No user input
- Tiny validation (1-2 fields)

## API Resource Cheat Sheet

Resources:

- Shape API output
- Hide sensitive fields
- Add computed fields
- Control response structure

Use Resources when:

- Frontend consumes the API
- Public or long-term API
- Sensitive fields exist
- Computed fields needed

Skip Resources when:

- Internal admin tools
- Prototypes
- Raw model output is acceptable

Models are NOT API contracts.
Resources ARE API contracts.

## Adding New Columns - What to Update

Normal column (address, phone):

- No relationship method
- Add to `$fillable` if used
- Update Request / Resource if exposed

Foreign key column (`country_id`):

- Add relationship method
- Update eager loading
- Update Resource

JSON / boolean / date column:

- Add `$casts`
- No relationship method

## Scaling Safely

Safe changes:

- Adding nullable columns
- Adding new endpoints
- Adding relationships

Dangerous changes:

- Renaming columns
- Removing fields
- Changing response structure

Always prefer additive changes.

## Final Mental Model

- Controller -> receives & returns
- Service -> does the work
- Model -> represents data
- Request -> validates input
- Resource -> formats output

One-line truth:
Add layers only when they reduce complexity - not because patterns exist.
