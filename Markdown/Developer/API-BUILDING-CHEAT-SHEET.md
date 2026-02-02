# LARAVEL API BUILDING CHEAT SHEET
**Your Quick Reference for Building APIs Independently**

---

## 🎯 **THE PATTERN (Use This Every Time)**

Every API module follows this exact sequence:

```
1. Controller  → 2. Form Requests → 3. Resource → 4. Service → 5. Routes → 6. Test
```

---

## 📋 **STEP-BY-STEP CHECKLIST**

### **Step 1: Controller** ✅

**Command:**
```bash
php artisan make:controller YourController
```

**Template to Copy:**
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreYourRequest;
use App\Http\Requests\UpdateYourRequest;
use App\Http\Resources\YourResource;
use App\Models\Your;
use App\Services\YourService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class YourController extends Controller
{
    protected YourService $yourService;

    public function __construct(YourService $yourService)
    {
        $this->yourService = $yourService;
    }

    // Get all
    public function index(): AnonymousResourceCollection
    {
        $items = $this->yourService->getAllYours();
        return YourResource::collection($items);
    }

    // Create new
    public function store(StoreYourRequest $request): JsonResponse
    {
        $item = $this->yourService->createYour($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Your created successfully',
            'data' => new YourResource($item)
        ], 201);
    }

    // Get single
    public function show($id): JsonResponse
    {
        $item = $this->yourService->getYourById($id);

        return response()->json([
            'success' => true,
            'data' => new YourResource($item)
        ]);
    }

    // Update
    public function update(UpdateYourRequest $request, $id): JsonResponse
    {
        $item = Your::findOrFail($id);
        $updated = $this->yourService->updateYour($item, $request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Your updated successfully',
            'data' => new YourResource($updated)
        ]);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $item = Your::findOrFail($id);
        $this->yourService->deleteYour($item);
        
        return response()->json([
            'success' => true,
            'message' => 'Your deleted successfully'
        ]);
    }
}
```

**What to Replace:**
- `Your` → Your model name (Site, Department, Position)
- `yourService` → lowercase version
- `'Your created successfully'` → Your message

**Key Points:**
- ✅ NO try-catch blocks (global handler does it)
- ✅ NO `int $id` type hints (use `$id`)
- ✅ Always inject Service via constructor
- ✅ Status codes: 200 (OK), 201 (Created)

---

### **Step 2: Form Requests** ✅

**Commands:**
```bash
php artisan make:request StoreYourRequest
php artisan make:request UpdateYourRequest
```

**StoreYourRequest Template:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreYourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:yours,name',
            'optional_field' => 'nullable|string|max:255',
            'foreign_key_id' => 'nullable|exists:other_table,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'name.unique' => 'This name already exists.',
            'foreign_key_id.exists' => 'The selected item does not exist.',
        ];
    }
}
```

**UpdateYourRequest Template:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateYourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('yours', 'name')->ignore($this->route('id'))
            ],
            'optional_field' => 'nullable|string|max:255',
            'foreign_key_id' => 'nullable|exists:other_table,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'name.unique' => 'This name already exists.',
            'foreign_key_id.exists' => 'The selected item does not exist.',
        ];
    }
}
```

**Common Validation Rules:**
```php
'required'              // Cannot be empty
'nullable'              // Can be null/empty
'string'                // Must be text
'max:255'               // Max length 255 characters
'unique:table,column'   // Must be unique in table
'exists:table,id'       // Must exist in other table (FK)
'email'                 // Must be valid email
'date'                  // Must be valid date
'integer'               // Must be number
```

**Key Points:**
- ✅ Store = `unique:table,column`
- ✅ Update = `Rule::unique()->ignore($this->route('id'))`
- ✅ Foreign keys = `nullable|exists:table,id`

---

### **Step 3: Resource** ✅

**Command:**
```bash
php artisan make:resource YourResource
```

**Template:**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class YourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'your_field' => $this->your_field,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            // Include relationship if loaded
            'relationship' => $this->whenLoaded('relationship', function() {
                return [
                    'id' => $this->relationship->id,
                    'name' => $this->relationship->name,
                ];
            }),
        ];
    }
}
```

**Key Points:**
- ✅ Use `?->` for nullable fields (null-safe operator)
- ✅ Format dates: `?->format('Y-m-d H:i:s')`
- ✅ Use `whenLoaded()` for relationships (prevents N+1)

---

### **Step 4: Service** ✅

**Command:**
```bash
php artisan make:class Services/YourService
```

**Template:**
```php
<?php

namespace App\Services;

use App\Models\Your;
use Illuminate\Support\Facades\DB;

class YourService
{
    // Get all with relationships
    public function getAllYours()
    {
        return Your::with(['relationship1', 'relationship2'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Get single by ID
    public function getYourById($id): Your
    {
        return Your::with(['relationship1', 'relationship2'])->findOrFail($id);
    }

    // Create new
    public function createYour(array $data): Your
    {
        return DB::transaction(function () use ($data) {
            return Your::create([
                'name' => $data['name'],
                'optional_field' => $data['optional_field'] ?? null,
                'foreign_key_id' => $data['foreign_key_id'] ?? null,
                'created_by' => auth()->id(),
            ]);
        });
    }

    // Update existing
    public function updateYour(Your $item, array $data): Your
    {
        return DB::transaction(function () use ($item, $data) {
            $item->update([
                'name' => $data['name'] ?? $item->name,
                'optional_field' => $data['optional_field'] ?? $item->optional_field,
                'foreign_key_id' => $data['foreign_key_id'] ?? $item->foreign_key_id,
            ]);

            return $item->fresh(['relationship1', 'relationship2']);
        });
    }

    // Delete
    public function deleteYour(Your $item): bool
    {
        return DB::transaction(function () use ($item) {
            return $item->delete();
        });
    }
}
```

**Key Points:**
- ✅ ALWAYS use `DB::transaction()` (data integrity)
- ✅ ALWAYS eager load: `with(['relationship'])`
- ✅ Use `??` for optional fields
- ✅ Use `fresh()` after update (reload with relationships)
- ✅ Set `created_by` to `auth()->id()` (audit trail)

---

### **Step 5: Routes** ✅

**Edit:** `routes/api.php`

**Template:**
```php
use App\Http\Controllers\YourController;

// Your Management Routes
Route::prefix('yours')->group(function() {
    Route::get('/', [YourController::class, 'index']);
    Route::post('/', [YourController::class, 'store']);
    Route::get('/{id}', [YourController::class, 'show']);
    Route::put('/{id}', [YourController::class, 'update']);
    Route::delete('/{id}', [YourController::class, 'destroy']);
});
```

**Verify:**
```bash
php artisan route:list --path=api/yours
```

Should show 5 routes!

---

### **Step 6: Postman Testing** ✅

**Variables to Add:**
```
base_url = http://127.0.0.1:8000
your_id = (empty, will be set by tests)
```

**5 Requests to Create:**

1. **Get All Yours**
   - Method: GET
   - URL: `{{base_url}}/api/yours`

2. **Create Your**
   - Method: POST
   - URL: `{{base_url}}/api/yours`
   - Body:
   ```json
   {
       "name": "Test {{$timestamp}}",
       "optional_field": "value"
   }
   ```

3. **Get Single Your**
   - Method: GET
   - URL: `{{base_url}}/api/yours/{{your_id}}`

4. **Update Your**
   - Method: PUT
   - URL: `{{base_url}}/api/yours/{{your_id}}`
   - Body:
   ```json
   {
       "name": "Updated {{$timestamp}}"
   }
   ```

5. **Delete Your**
   - Method: DELETE
   - URL: `{{base_url}}/api/yours/{{your_id}}`

---

## 🔥 **COMMON MISTAKES TO AVOID**

❌ **DON'T:**
- Use `int $id` in controllers (use `$id`)
- Use try-catch in controllers (global handler does it)
- Forget `DB::transaction()`
- Hardcode IDs in Postman
- Edit old migrations (create new ones)
- Use `$request->is('api/*')` alone (add `|| $request->expectsJson()`)

✅ **DO:**
- Remove type hints from route parameters
- Use `DB::transaction()` in services
- Eager load relationships: `with()`
- Use `{{$timestamp}}` in Postman
- Use variables: `{{your_id}}`
- Always use `fresh()` after updates

---

## 🎓 **QUICK REFERENCE: What Goes Where**

| File | Purpose | What Goes Here |
|---|---|---|
| **Controller** | Handle HTTP | Receive request, call service, return JSON |
| **Form Request** | Validation | Rules, messages, authorize |
| **Resource** | JSON Format | Transform model to API response |
| **Service** | Business Logic | Database operations, transactions |
| **Routes** | URL Mapping | Map URLs to controller methods |
| **Model** | Database | Relationships, fillable, casts |

---

## 💡 **WHEN YOU'RE STUCK**

### **"I don't know what validation rules to use"**
Look at your migration file → See what's required/nullable

### **"I don't know what relationships to load"**
Look at your Resource file → See what `whenLoaded()` you have

### **"Controller is too complex"**
Move logic to Service → Controller should be thin

### **"Getting 500 errors"**
Check `storage/logs/laravel.log` for details

### **"Tests failing in Postman"**
Make sure you're using `{{your_id}}` not hardcoded IDs

---

## 📚 **EXAMPLES FROM YOUR PROJECT**

### **Simple Entity (Company)**
- No complex relationships
- Just creator relationship
- Nullable office_location

### **Entity with FK (Site)**
- Belongs to Company (nullable)
- Has creator relationship
- Eager loads: `with(['company', 'creator'])`

### **Complex Entity (User)**
- Has UserProfile (2 tables)
- Multiple relationships (company, site, department, position, role)
- Uses DB::transaction for both tables

---

## 🚀 **YOUR WORKFLOW (Memorize This)**

```
1. Run: php artisan make:controller YourController
2. Copy controller template → Replace "Your" with your model
3. Run: php artisan make:request StoreYourRequest
4. Run: php artisan make:request UpdateYourRequest  
5. Copy request templates → Add your validation rules
6. Run: php artisan make:resource YourResource
7. Copy resource template → Add your fields
8. Run: php artisan make:class Services/YourService
9. Copy service template → Add your logic
10. Edit routes/api.php → Add your routes
11. Run: php artisan route:list --path=api/yours → Verify
12. Open Postman → Create 5 requests
13. Test each endpoint
14. Done! ✅
```

---

## ⚡ **SPEED TIPS**

**Copy From Previous Module:**
- ✅ CompanyController → SiteController (just find/replace)
- ✅ Same for Requests, Resources, Services
- ✅ Pattern is identical every time

**Use VS Code:**
- `Ctrl+H` = Find and replace
- Replace "Company" → "Site" everywhere
- Replace "companies" → "sites"
- Done in 2 minutes!

**Key Insight:**
> Every API module is 95% identical. Only the field names change!

---

## 🎯 **NEXT TIME YOU BUILD ALONE**

1. Open this cheat sheet
2. Copy Company/Site files as templates
3. Find/replace the names
4. Adjust validation rules (check migration)
5. Test in Postman
6. Done!

**You got this!** 💪

---

**Remember:** 
- Pattern stays the same
- Only model names and fields change
- Copy, don't create from scratch
- Reference this cheat sheet every time

**Bookmark this file!** 🔖
