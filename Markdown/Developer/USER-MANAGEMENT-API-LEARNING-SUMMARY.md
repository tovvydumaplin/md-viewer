# User Management API - Learning Summary

**Date:** February 1, 2026  
**Project:** IRPMI Backend  
**Module:** User Management CRUD API

---

## 📁 Files Created Today

### **Controllers** (`app/Http/Controllers/`)

#### **UserController.php**
- **Why:** Handle incoming HTTP requests for user management
- **What it does:** Receives requests, calls service methods, returns JSON responses
- **Methods:** `index()`, `store()`, `show()`, `update()`, `destroy()`
- **Pattern:** Thin controller - delegates logic to UserService

---

### **Requests** (`app/Http/Requests/`)

#### **StoreUserRequest.php**
- **Why:** Validate data when creating new users
- **What it does:** Checks required fields, unique constraints, data types
- **Key rules:** 
  - Email must be unique in `users` table
  - Password min 8 chars with confirmation
  - Employee_id must be unique in `user_profiles` table
- **Custom messages:** User-friendly error messages

#### **UpdateUserRequest.php**
- **Why:** Validate data when updating existing users
- **What it does:** Same as StoreUserRequest but allows keeping current values
- **Key difference:** 
  - All fields use `sometimes` instead of `required`
  - Uses `Rule::unique()->ignore($userId)` to allow user's own email/employee_id
  - Gets user ID from route: `$this->route('id')`

---

### **Resources** (`app/Http/Resources/`)

#### **UserResource.php**
- **Why:** Format user data consistently for API responses
- **What it does:** 
  - Transforms User model into structured JSON
  - Includes nested relationships (profile, company, site, department, position, role)
  - Adds computed fields like `status_text`
  - Hides sensitive data (passwords never exposed)
- **Features:** Uses `$this->when()` for conditional field inclusion

---

### **Services** (`app/Services/`)

#### **UserService.php**
- **Why:** Handle business logic and database operations
- **What it does:** All CRUD operations with proper transactions and relationships
- **Methods Created:**
  - `createUser()` - Creates user + profile in DB transaction
  - `getAllUsers()` - Gets all users with eager loaded relationships
  - `getUserById()` - Gets single user with relationships using `findOrFail()`
  - `updateUser()` - Updates both user and profile data
  - `deleteUser()` - Deletes profile first, then user (foreign key order)
- **Key Features:**
  - Uses `DB::transaction()` for data integrity
  - Eager loads relationships to avoid N+1 queries
  - Hashes passwords before saving
  - Returns fresh data after updates

---

### **Routes** (`routes/`)

#### **api.php**
- **Why:** Define API endpoints and map to controller methods
- **What it does:** Registers 5 RESTful routes under `/api/users` prefix
- **Routes Created:**
  ```php
  GET    /api/users          → UserController@index
  POST   /api/users          → UserController@store
  GET    /api/users/{id}     → UserController@show
  PUT    /api/users/{id}     → UserController@update
  DELETE /api/users/{id}     → UserController@destroy
  ```
- **Pattern:** Using `Route::prefix()` for clean grouping

---

### **Configuration** (`bootstrap/`)

#### **app.php**
- **Why:** Register API routes with Laravel application
- **What we modified:** Added API routes to the routing configuration
- **Changes:**
  ```php
  ->withRouting(
      web: __DIR__.'/../routes/web.php',
      api: __DIR__.'/../routes/api.php',  // ← Added this line
      commands: __DIR__.'/../routes/console.php',
      health: '/up',
  )
  ```
- **Effect:** All routes in `api.php` now automatically get `/api` prefix

---

## 📚 What We Built

A complete **User Management API** with full CRUD operations:

- ✅ **GET** `/api/users` - Get all users
- ✅ **POST** `/api/users` - Create new user
- ✅ **GET** `/api/users/{id}` - Get single user
- ✅ **PUT** `/api/users/{id}` - Update user
- ✅ **DELETE** `/api/users/{id}` - Delete user

---

## 🏗️ Architecture Layers (What Each Layer Does)

### 1. **Routes** (`routes/api.php`)
- **Purpose:** Define URL endpoints and map them to controller methods
- **Example:**
  ```php
  Route::prefix('users')->group(function() {
      Route::get('/', [UserController::class, 'index']);
      Route::post('/', [UserController::class, 'store']);
  });
  ```
- **Key Point:** Routes in `api.php` automatically get `/api` prefix

### 2. **Controller** (`app/Http/Controllers/UserController.php`)
- **Purpose:** Handle HTTP requests, coordinate between services, return responses
- **Responsibilities:**
  - Receive requests
  - Call service methods
  - Handle errors with try-catch
  - Return JSON responses
- **Does NOT:** Contain business logic or database queries

### 3. **Form Requests** (`app/Http/Requests/`)
- **Purpose:** Validate incoming data before it reaches the controller
- **Files Created:**
  - `StoreUserRequest.php` - Validation for creating users
  - `UpdateUserRequest.php` - Validation for updating users
- **Key Features:**
  - `rules()` method defines validation rules
  - `messages()` method customizes error messages
  - `authorize()` method controls access (RBAC later)
- **Why Separate Files?** Keep validation logic out of controllers, reusable

### 4. **Service Layer** (`app/Services/UserService.php`)
- **Purpose:** Business logic, database transactions, complex operations
- **Responsibilities:**
  - Database operations (create, read, update, delete)
  - DB transactions (ensuring data consistency)
  - Eager loading relationships
  - Password hashing
- **Why?** Keeps controllers thin, makes code testable and reusable

### 5. **Resources** (`app/Http/Resources/UserResource.php`)
- **Purpose:** Transform model data into consistent JSON API responses
- **Responsibilities:**
  - Format data for API output
  - Hide sensitive fields (like passwords)
  - Add computed fields (like `status_text`)
  - Include relationships conditionally
- **Why?** Consistent API responses, control what data is exposed

### 6. **Models** (`app/Models/User.php`)
- **Purpose:** Represent database tables, define relationships
- **Already existed, we reviewed and fixed:**
  - Added missing relationships
  - Fixed `scopeActive` bug
  - Verified fillable fields

---

## 🎓 Key Lessons Learned

### 1. **Always Add `Accept: application/json` Header**
- **Problem:** Getting HTML error pages instead of JSON
- **Solution:** Add `Accept: application/json` in Postman headers for ALL API requests
- **Why?** Tells Laravel to return JSON responses for errors

### 2. **Route Parameters Must Match**
- **Problem:** `$this->route('user')` but route defined as `/{id}`
- **Solution:** Use `$this->route('id')` to match the route parameter name
- **Lesson:** Route parameter names in URL must match what you fetch in code

### 3. **Cache Issues Are Real**
- **Commands We Used:**
  ```bash
  php artisan config:clear
  php artisan cache:clear
  php artisan route:clear
  php artisan optimize:clear
  ```
- **When to Clear:** After changing routes, namespaces, or getting weird class errors

### 4. **Database Transactions for Related Data**
- **Why?** User and UserProfile must be created together
- **How?** Wrap in `DB::transaction()` - if one fails, both rollback
- **Code:**
  ```php
  DB::transaction(function () use ($data) {
      $user = User::create([...]);
      UserProfile::create(['user_id' => $user->id, ...]);
  });
  ```

### 5. **Unique Validation with Ignore**
- **Problem:** When updating, email/employee_id should allow current user's own values
- **Solution:**
  ```php
  Rule::unique('users','email')->ignore($userId)
  ```

### 6. **Eager Loading Relationships**
- **Bad:** Loading relationships in separate queries (N+1 problem)
- **Good:** Load all at once with `with()`
  ```php
  User::with(['profile.company', 'profile.site', 'role'])->get();
  ```

### 7. **Use `findOrFail()` for 404 Errors**
- **`find($id)`** - Returns `null` if not found (requires manual checks)
- **`findOrFail($id)`** - Throws `ModelNotFoundException` (automatic 404)
- **Better:** Use `findOrFail()` and catch the exception

### 8. **HTTP Status Codes Matter**
- **200** - Success (GET, PUT)
- **201** - Created (POST)
- **404** - Not Found
- **422** - Validation Failed
- **500** - Server Error

---

## 📝 Step-by-Step Guide: Creating New Controllers

### **Do I Need All These Files for Every Controller?**

**Short Answer:** It depends on complexity, but here's the rule:

| Component | When to Create | Skip If... |
|-----------|----------------|------------|
| **Controller** | ✅ Always | Never |
| **Service** | ✅ For complex logic | Simple CRUD with no business logic |
| **Form Request** | ✅ For data validation | No user input (GET-only APIs) |
| **Resource** | ✅ For API responses | Internal APIs or simple data |
| **Routes** | ✅ Always | Never |

---

### **Complete Workflow: Creating a New Module (e.g., "Departments")**

#### **Step 1: Plan Your Module**
- What endpoints do you need? (GET, POST, PUT, DELETE?)
- What data validation is required?
- Any complex business logic?
- What relationships to load?

#### **Step 2: Create the Controller**
```bash
php artisan make:controller DepartmentController
```

**Basic Structure:**
```php
<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    protected DepartmentService $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    public function index()
    {
        $departments = $this->departmentService->getAllDepartments();
        return DepartmentResource::collection($departments);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        try {
            $department = $this->departmentService->createDepartment($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => new DepartmentResource($department)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add: show, update, destroy methods following same pattern
}
```

#### **Step 3: Create Form Requests (If Validating Input)**
```bash
php artisan make:request StoreDepartmentRequest
php artisan make:request UpdateDepartmentRequest
```

**StoreDepartmentRequest.php:**
```php
public function authorize(): bool
{
    return true; // Implement RBAC later
}

public function rules(): array
{
    return [
        'name' => 'required|string|max:100|unique:departments,name',
        'code' => 'required|string|max:50|unique:departments,code',
        'company_id' => 'required|exists:companies,id',
        'site_id' => 'nullable|exists:sites,id',
    ];
}

public function messages(): array
{
    return [
        'name.required' => 'Department name is required.',
        'name.unique' => 'This department name already exists.',
    ];
}
```

**UpdateDepartmentRequest.php:**
```php
public function rules(): array
{
    $departmentId = $this->route('id'); // Match your route parameter!

    return [
        'name' => [
            'sometimes',
            'string',
            'max:100',
            Rule::unique('departments','name')->ignore($departmentId)
        ],
        'code' => [
            'sometimes',
            'string',
            'max:50',
            Rule::unique('departments','code')->ignore($departmentId)
        ],
        'company_id' => 'sometimes|exists:companies,id',
        'site_id' => 'nullable|exists:sites,id',
    ];
}
```

#### **Step 4: Create Service (If Business Logic Exists)**
```bash
# Create manually: app/Services/DepartmentService.php
```

```php
<?php
namespace App\Services;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;

class DepartmentService
{
    public function getAllDepartments(): Collection
    {
        return Department::with(['company', 'site'])->get();
    }

    public function createDepartment(array $data): Department
    {
        return Department::create($data);
    }

    public function getDepartmentById(int $id): Department
    {
        return Department::with(['company', 'site'])->findOrFail($id);
    }

    public function updateDepartment(Department $department, array $data): Department
    {
        $department->update($data);
        return $department->fresh(['company', 'site']);
    }

    public function deleteDepartment(Department $department): bool
    {
        return $department->delete();
    }
}
```

#### **Step 5: Create Resource (If Returning API Data)**
```bash
php artisan make:resource DepartmentResource
```

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'company' => [
                'id' => $this->company?->id,
                'name' => $this->company?->name,
            ],
            'site' => $this->when($this->site, [
                'id' => $this->site?->id,
                'name' => $this->site?->name,
            ]),
            'status' => $this->status,
            'status_text' => $this->getStatusText(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }

    private function getStatusText(): string
    {
        return match($this->status) {
            0 => 'Inactive',
            1 => 'Active',
            default => 'Unknown',
        };
    }
}
```

#### **Step 6: Register Routes**
In `routes/api.php`:
```php
use App\Http\Controllers\DepartmentController;

Route::prefix('departments')->group(function() {
    Route::get('/', [DepartmentController::class, 'index']);
    Route::post('/', [DepartmentController::class, 'store']);
    Route::get('/{id}', [DepartmentController::class, 'show']);
    Route::put('/{id}', [DepartmentController::class, 'update']);
    Route::delete('/{id}', [DepartmentController::class, 'destroy']);
});
```

#### **Step 7: Test in Postman**
1. Create Postman collection: "Department Management"
2. Add all 5 requests
3. **Set headers:**
   - `Accept: application/json`
   - `Content-Type: application/json`
4. Test each endpoint

---

## ⚡ Quick Decision Tree

### **"Do I need a Service Layer?"**
```
Does your operation involve:
├─ Multiple database tables? → YES
├─ Complex business logic? → YES
├─ Transactions (all-or-nothing)? → YES
├─ Reusable logic across controllers? → YES
└─ Simple CRUD with no logic? → NO (can skip)
```

### **"Do I need Form Requests?"**
```
Are you:
├─ Accepting user input (POST/PUT)? → YES
├─ Need validation rules? → YES
├─ Only reading data (GET)? → NO (can skip)
└─ Internal API with trusted data? → NO (can skip)
```

### **"Do I need a Resource?"**
```
Are you:
├─ Building a public API? → YES
├─ Need consistent response format? → YES
├─ Hiding sensitive fields? → YES
├─ Adding computed fields? → YES
├─ Returning raw model data is fine? → NO (can skip)
└─ Internal tool, no external consumers? → MAYBE
```

---

## 🚀 Best Practices Checklist

### **Controller Best Practices:**
- ✅ Keep controllers thin - delegate to services
- ✅ Use try-catch for error handling
- ✅ Return consistent JSON structure
- ✅ Use proper HTTP status codes
- ✅ Type-hint parameters and return types

### **Validation Best Practices:**
- ✅ Use Form Requests, not inline validation
- ✅ Customize error messages for better UX
- ✅ Use `Rule::unique()->ignore()` for updates
- ✅ Match route parameter names exactly

### **Service Best Practices:**
- ✅ Use DB transactions for multi-table operations
- ✅ Use eager loading to avoid N+1 queries
- ✅ Use `findOrFail()` for automatic 404s
- ✅ Return fresh data after updates

### **API Best Practices:**
- ✅ Always use `Accept: application/json` header
- ✅ Use Resources for consistent responses
- ✅ Document your APIs (Postman collections)
- ✅ Test all error scenarios (404, 422, 500)

### **Database Best Practices:**
- ✅ Use migrations for schema changes
- ✅ Define relationships in models
- ✅ Use eager loading for performance
- ✅ Use transactions for data integrity

---

## 🛠️ Common Issues & Solutions

### **Issue 1: Getting HTML Instead of JSON**
**Solution:** Add `Accept: application/json` header

### **Issue 2: Class Not Found Errors**
**Solution:** Run `php artisan optimize:clear`

### **Issue 3: Route Parameter Mismatch**
**Solution:** Ensure `$this->route('id')` matches your route `/{id}`

### **Issue 4: Validation Not Working**
**Solution:** Check `authorize()` returns `true` in Form Request

### **Issue 5: 404 Not Working**
**Solution:** Use `findOrFail()` instead of `find()` in Service

---

## 📦 File Structure Summary

```
app/
├── Http/
│   ├── Controllers/
│   │   └── UserController.php          ✅ Handles HTTP requests
│   ├── Requests/
│   │   ├── StoreUserRequest.php        ✅ Validates create
│   │   └── UpdateUserRequest.php       ✅ Validates update
│   └── Resources/
│       └── UserResource.php            ✅ Formats JSON responses
└── Services/
    └── UserService.php                 ✅ Business logic

routes/
└── api.php                             ✅ API endpoints

bootstrap/
└── app.php                             ✅ Route registration
```

---

## 📚 Next Steps

1. **Add Authentication:** Implement Laravel Sanctum for API tokens
2. **Add Authorization:** Use Laravel Policies for RBAC
3. **Add Pagination:** For `index()` methods returning large datasets
4. **Add Filtering:** Query parameters for searching/filtering
5. **Add Tests:** Unit tests for Services, Feature tests for APIs
6. **Build More Modules:** Apply same pattern to other entities

---

## 💡 Remember

> **"Controllers are traffic cops, Services are workers, Models are data structures, Requests are gatekeepers, Resources are presenters."**

When in doubt:
1. **Controller** → Receives and returns
2. **Service** → Does the work
3. **Model** → Represents data
4. **Request** → Validates input
5. **Resource** → Formats output

---

**Happy Coding! 🎉**
