# Coding Standards & Best Practices

**Project:** IRPMI System  
**Date:** January 27, 2026  
**Version:** 1.0

---

## 📋 Table of Contents
1. [General Principles](#general-principles)
2. [PHP/Laravel Backend Standards](#phplaravel-backend-standards)
3. [Vue 3/JavaScript Frontend Standards](#vue-3javascript-frontend-standards)
4. [Database Standards](#database-standards)
5. [API Standards](#api-standards)
6. [Git Commit Standards](#git-commit-standards)
7. [File Organization](#file-organization)
8. [Security Standards](#security-standards)

---

## 🎯 General Principles

### Code Quality Goals
- **Readable**: Code should be self-documenting
- **Maintainable**: Easy to modify and extend
- **Testable**: Functions should be pure and isolated
- **Consistent**: Follow established patterns
- **Secure**: Never trust user input

### The Boy Scout Rule
> "Always leave the code cleaner than you found it."

---

## 🐘 PHP/Laravel Backend Standards

### Naming Conventions

#### Classes
```php
// ✅ PascalCase for classes
class ApprovalFlowService { }
class UserController { }
class ApprovalFlow extends Model { }

// ❌ Wrong
class approval_flow_service { }
class usercontroller { }
```

#### Methods and Variables
```php
// ✅ camelCase for methods and variables
public function createApprovalFlow($flowData) 
{
    $approvalSteps = [];
    $isValid = true;
}

// ❌ Wrong
public function CreateApprovalFlow($flow_data) 
{
    $approval_steps = [];
    $is_valid = true;
}
```

#### Constants
```php
// ✅ UPPERCASE with underscores
const MAX_APPROVAL_STEPS = 10;
const DEFAULT_TIMEOUT_DAYS = 3;

// ❌ Wrong
const maxApprovalSteps = 10;
const defaultTimeoutDays = 3;
```

### Controller Standards

#### Keep Controllers Thin
```php
// ✅ CORRECT: Controller delegates to Service
class ApprovalFlowController extends Controller
{
    public function __construct(
        private ApprovalFlowService $approvalFlowService
    ) {}
    
    public function store(StoreApprovalFlowRequest $request)
    {
        $flow = $this->approvalFlowService->createFlow(
            $request->validated()
        );
        
        return response()->json($flow, 201);
    }
}

// ❌ WRONG: Business logic in Controller
class ApprovalFlowController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validated = $request->validate([...]);
        
        // Business logic (should be in Service!)
        $flow = ApprovalFlow::create($validated);
        
        foreach ($request->rules as $rule) {
            ApprovalFlowRule::create([...]);
        }
        
        // More business logic...
        
        return response()->json($flow, 201);
    }
}
```

#### Resource Responses
```php
// ✅ Use API Resources for consistent responses
return new ApprovalFlowResource($flow);
return ApprovalFlowResource::collection($flows);

// ❌ Don't return raw models
return $flow; // Exposes all fields, no control
```

### Service Class Standards

#### Single Responsibility
```php
// ✅ CORRECT: Each service has clear purpose
class ApprovalFlowService
{
    public function resolveFlow(array $requestData): ApprovalFlow
    {
        // Flow resolution logic only
    }
    
    public function evaluateRules(ApprovalFlow $flow, array $data): bool
    {
        // Rule evaluation logic only
    }
}

class ApprovalProcessingService
{
    public function createApprovalInstances(string $requestId, ApprovalFlow $flow): void
    {
        // Create approval instances
    }
    
    public function processApproval(Approval $approval, string $action): void
    {
        // Process approve/reject
    }
}

// ❌ WRONG: God class doing everything
class ApprovalService
{
    // Doing flow resolution, rule evaluation, processing, notifications, etc.
}
```

#### Service Method Structure
```php
// ✅ CORRECT: Clean, documented, typed
class ApprovalFlowService
{
    /**
     * Resolve which approval flow to use based on request data
     * 
     * @param array $requestData Request data to evaluate against rules
     * @return ApprovalFlow The matched flow or default flow
     * @throws ApprovalFlowNotFoundException When no flow is found
     */
    public function resolveFlow(array $requestData): ApprovalFlow
    {
        // 1. Try flows with rules
        $flowsWithRules = ApprovalFlow::with('rules')
            ->where('module_id', $requestData['module_id'])
            ->where('is_active', true)
            ->whereHas('rules')
            ->get();
        
        foreach ($flowsWithRules as $flow) {
            if ($this->evaluateRules($flow, $requestData)) {
                return $flow;
            }
        }
        
        // 2. Fallback to default flow
        $defaultFlow = ApprovalFlow::where('module_id', $requestData['module_id'])
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();
        
        if (!$defaultFlow) {
            throw new ApprovalFlowNotFoundException(
                "No approval flow found for module {$requestData['module_id']}"
            );
        }
        
        return $defaultFlow;
    }
}
```

### Model Standards

#### Use Type Hints
```php
// ✅ CORRECT: Type hints everywhere
class ApprovalFlow extends Model
{
    protected $fillable = [
        'module_id',
        'flow_name',
        'match_type',
        'is_default',
        'is_active',
    ];
    
    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'timeout_days' => 'integer',
    ];
    
    public function rules(): HasMany
    {
        return $this->hasMany(ApprovalFlowRule::class);
    }
    
    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalFlowStep::class)
            ->orderBy('step_order');
    }
}

// ❌ WRONG: No type hints
public function rules()
{
    return $this->hasMany(ApprovalFlowRule::class);
}
```

#### Scopes for Reusability
```php
// ✅ Use query scopes
class ApprovalFlow extends Model
{
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    public function scopeForModule($query, int $moduleId)
    {
        return $query->where('module_id', $moduleId);
    }
    
    public function scopeWithRules($query)
    {
        return $query->whereHas('rules');
    }
}

// Usage:
$flows = ApprovalFlow::active()
    ->forModule(2)
    ->withRules()
    ->get();
```

### Request Validation

#### Form Requests
```php
// ✅ CORRECT: Use Form Requests
class StoreApprovalFlowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ApprovalFlow::class);
    }
    
    public function rules(): array
    {
        return [
            'module_id' => 'required|exists:modules,id',
            'flow_name' => 'required|string|max:255',
            'match_type' => 'required|in:ALL,ANY',
            'is_default' => 'boolean',
            'timeout_days' => 'integer|min:1|max:30',
            
            'rules' => 'array',
            'rules.*.field' => 'required|string',
            'rules.*.operator' => 'required|in:>,>=,<,<=,=,!=,BETWEEN',
            'rules.*.value' => 'required|string',
            
            'steps' => 'required|array|min:1',
            'steps.*.step_order' => 'required|integer|min:1',
            'steps.*.approver_type' => 'required|in:user,role,immediate_superior,department_head',
            'steps.*.approver_ref_id' => 'nullable|integer',
        ];
    }
    
    public function messages(): array
    {
        return [
            'flow_name.required' => 'Please provide a flow name',
            'steps.required' => 'At least one approval step is required',
        ];
    }
}

// Usage in controller:
public function store(StoreApprovalFlowRequest $request)
{
    // Validation already done, data is safe
    $flow = $this->approvalFlowService->createFlow($request->validated());
    return new ApprovalFlowResource($flow);
}
```

### Error Handling

#### Custom Exceptions
```php
// ✅ Use custom exceptions
namespace App\Exceptions;

class ApprovalFlowNotFoundException extends \Exception
{
    public function render()
    {
        return response()->json([
            'error' => 'Approval Flow Not Found',
            'message' => $this->getMessage()
        ], 404);
    }
}

// Usage:
throw new ApprovalFlowNotFoundException("No flow found for module {$moduleId}");
```

#### Try-Catch in Services
```php
// ✅ Handle exceptions properly
public function createFlow(array $data): ApprovalFlow
{
    DB::beginTransaction();
    
    try {
        $flow = ApprovalFlow::create([
            'module_id' => $data['module_id'],
            'flow_name' => $data['flow_name'],
            'match_type' => $data['match_type'],
        ]);
        
        // Create rules
        foreach ($data['rules'] ?? [] as $rule) {
            $flow->rules()->create($rule);
        }
        
        // Create steps
        foreach ($data['steps'] as $step) {
            $flow->steps()->create($step);
        }
        
        DB::commit();
        return $flow->load(['rules', 'steps']);
        
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Failed to create approval flow', [
            'data' => $data,
            'error' => $e->getMessage()
        ]);
        throw $e;
    }
}
```

### Code Documentation

#### PHPDoc Standards
```php
/**
 * Evaluate approval flow rules against request data
 * 
 * This method checks if the provided request data matches the flow's rules
 * based on the flow's match_type (ALL = AND, ANY = OR)
 * 
 * @param ApprovalFlow $flow The approval flow with loaded rules
 * @param array $requestData The request data to evaluate
 * @return bool True if rules match, false otherwise
 * 
 * @example
 * $matches = $service->evaluateRules($flow, [
 *     'amount' => 55000,
 *     'travel_days' => 7,
 *     'user_id' => 123
 * ]);
 */
public function evaluateRules(ApprovalFlow $flow, array $requestData): bool
{
    // Implementation...
}
```

---

## ⚡ Vue 3/JavaScript Frontend Standards

### Naming Conventions

#### Components
```javascript
// ✅ PascalCase for component files and names
// File: ApprovalFlowAdmin.vue
<script setup>
defineOptions({
  name: 'ApprovalFlowAdmin'
})
</script>

// ❌ Wrong
// File: approval-flow-admin.vue or approvalFlowAdmin.vue
```

#### Variables and Functions
```javascript
// ✅ camelCase for variables and functions
const approvalFlows = ref([])
const selectedFlow = ref(null)

function createApprovalFlow(flowData) {
  // ...
}

// ❌ Wrong
const approval_flows = ref([])
const SelectedFlow = ref(null)

function CreateApprovalFlow(flow_data) {
  // ...
}
```

#### Constants
```javascript
// ✅ UPPERCASE with underscores
const MAX_STEP_ORDER = 10
const API_BASE_URL = 'http://localhost:8000/api'

// ❌ Wrong
const maxStepOrder = 10
const apiBaseUrl = 'http://localhost:8000/api'
```

### Component Structure

#### Composition API (Script Setup)
```vue
<!-- ✅ CORRECT: Clean structure with script setup -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApprovalFlowStore } from '@/stores/approvalFlow'
import ApprovalFlowCard from '@/components/ApprovalFlowCard.vue'

// Props
const props = defineProps({
  moduleId: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['flowCreated', 'flowDeleted'])

// Store
const approvalFlowStore = useApprovalFlowStore()

// State
const flows = ref([])
const selectedFlow = ref(null)
const isLoading = ref(false)

// Computed
const activeFlows = computed(() => 
  flows.value.filter(flow => flow.is_active)
)

// Methods
async function fetchFlows() {
  isLoading.value = true
  try {
    flows.value = await approvalFlowStore.fetchFlows(props.moduleId)
  } catch (error) {
    console.error('Failed to fetch flows:', error)
  } finally {
    isLoading.value = false
  }
}

function selectFlow(flow) {
  selectedFlow.value = flow
  emit('flowCreated', flow)
}

// Lifecycle
onMounted(() => {
  fetchFlows()
})
</script>

<template>
  <div class="approval-flow-admin">
    <!-- Template content -->
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
```

#### Component Props Validation
```javascript
// ✅ CORRECT: Proper validation
const props = defineProps({
  flow: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.flow_name && value.match_type
    }
  },
  editable: {
    type: Boolean,
    default: false
  },
  maxSteps: {
    type: Number,
    default: 10,
    validator: (value) => value > 0
  }
})

// ❌ WRONG: No validation
const props = defineProps(['flow', 'editable', 'maxSteps'])
```

### State Management (Pinia)

#### Store Structure
```javascript
// ✅ CORRECT: Well-structured store
// File: stores/approvalFlow.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as flowService from '@/services/flowService'

export const useApprovalFlowStore = defineStore('approvalFlow', () => {
  // State
  const flows = ref([])
  const selectedFlow = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  
  // Getters (computed)
  const activeFlows = computed(() => 
    flows.value.filter(flow => flow.is_active)
  )
  
  const getFlowById = computed(() => {
    return (id) => flows.value.find(flow => flow.id === id)
  })
  
  // Actions
  async function fetchFlows(moduleId) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await flowService.getFlows(moduleId)
      flows.value = response.data
      return flows.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  async function createFlow(flowData) {
    try {
      const response = await flowService.createFlow(flowData)
      flows.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  function selectFlow(flow) {
    selectedFlow.value = flow
  }
  
  function clearError() {
    error.value = null
  }
  
  return {
    // State
    flows,
    selectedFlow,
    isLoading,
    error,
    // Getters
    activeFlows,
    getFlowById,
    // Actions
    fetchFlows,
    createFlow,
    selectFlow,
    clearError
  }
})
```

### API Service Layer

#### Axios Service Structure
```javascript
// ✅ CORRECT: Centralized API service
// File: services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true, // For Sanctum cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

export default api
```

#### Resource-specific Services
```javascript
// ✅ CORRECT: Clean service methods
// File: services/flowService.js
import api from './api'

export const getFlows = (moduleId) => {
  return api.get('/approval-flows', { params: { module_id: moduleId } })
}

export const getFlowById = (id) => {
  return api.get(`/approval-flows/${id}`)
}

export const createFlow = (flowData) => {
  return api.post('/approval-flows', flowData)
}

export const updateFlow = (id, flowData) => {
  return api.patch(`/approval-flows/${id}`, flowData)
}

export const deleteFlow = (id) => {
  return api.delete(`/approval-flows/${id}`)
}

export const addRule = (flowId, ruleData) => {
  return api.post(`/approval-flows/${flowId}/rules`, ruleData)
}

export const updateRule = (ruleId, ruleData) => {
  return api.patch(`/rules/${ruleId}`, ruleData)
}

export const deleteRule = (ruleId) => {
  return api.delete(`/rules/${ruleId}`)
}
```

### Template Standards

#### Use Semantic HTML
```vue
<!-- ✅ CORRECT: Semantic HTML -->
<template>
  <article class="flow-card">
    <header class="flow-card-header">
      <h3>{{ flow.flow_name }}</h3>
    </header>
    
    <section class="flow-card-body">
      <ul class="rule-list">
        <li v-for="rule in flow.rules" :key="rule.id">
          {{ rule.field }} {{ rule.operator }} {{ rule.value }}
        </li>
      </ul>
    </section>
    
    <footer class="flow-card-footer">
      <button @click="editFlow">Edit</button>
      <button @click="deleteFlow">Delete</button>
    </footer>
  </article>
</template>

<!-- ❌ WRONG: Div soup -->
<template>
  <div class="flow-card">
    <div class="flow-card-header">
      <div>{{ flow.flow_name }}</div>
    </div>
    <div class="flow-card-body">
      <div v-for="rule in flow.rules" :key="rule.id">
        {{ rule.field }} {{ rule.operator }} {{ rule.value }}
      </div>
    </div>
    <div class="flow-card-footer">
      <div @click="editFlow">Edit</div>
      <div @click="deleteFlow">Delete</div>
    </div>
  </div>
</template>
```

#### Conditional Rendering
```vue
<!-- ✅ CORRECT: Use v-if/v-show appropriately -->
<template>
  <!-- v-if: Removed from DOM when false (better for rarely changed) -->
  <div v-if="isLoggedIn">
    <UserDashboard />
  </div>
  
  <!-- v-show: Hidden with CSS (better for frequently toggled) -->
  <div v-show="isDrawerOpen">
    <FlowDrawer />
  </div>
  
  <!-- v-else with v-if -->
  <div v-if="isLoading">
    Loading...
  </div>
  <div v-else-if="hasError">
    Error: {{ errorMessage }}
  </div>
  <div v-else>
    <FlowList :flows="flows" />
  </div>
</template>
```

### Error Handling

#### Try-Catch in Async Functions
```javascript
// ✅ CORRECT: Proper error handling
async function createApprovalFlow(flowData) {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await flowService.createFlow(flowData)
    flows.value.push(response.data)
    
    // Show success notification
    showToast('Flow created successfully', 'success')
    
    return response.data
  } catch (err) {
    // Log error
    console.error('Failed to create flow:', err)
    
    // Set error state
    error.value = err.response?.data?.message || 'Failed to create flow'
    
    // Show error notification
    showToast(error.value, 'error')
    
    // Re-throw if needed
    throw err
  } finally {
    isLoading.value = false
  }
}
```

---

## 🗄️ Database Standards

### Table Naming
```sql
-- ✅ Lowercase, plural, snake_case
approval_flows
approval_flow_rules
user_permission_overrides

-- ❌ Wrong
ApprovalFlows
approvalFlowRule
userPermissionOverride
```

### Column Naming
```sql
-- ✅ Lowercase, snake_case
flow_name
match_type
is_active
created_at

-- ❌ Wrong
FlowName
matchType
isActive
createdAt
```

### Foreign Keys
```sql
-- ✅ Singular table name + _id
user_id
role_id
approval_flow_id

-- ❌ Wrong
users_id
roleID
flow_id (ambiguous)
```

### Indexes
```sql
-- ✅ Descriptive names
CREATE INDEX idx_approvals_pending ON approvals(approver_user_id, status);
CREATE INDEX idx_flow_rules_lookup ON approval_flow_rules(approval_flow_id, is_active);

-- ❌ Wrong
CREATE INDEX index1 ON approvals(approver_user_id, status);
CREATE INDEX idx1 ON approval_flow_rules(approval_flow_id, is_active);
```

---

## 🔌 API Standards

### Endpoint Naming
```
✅ CORRECT: RESTful conventions
GET    /api/approval-flows          (List all)
POST   /api/approval-flows          (Create)
GET    /api/approval-flows/{id}     (Get one)
PATCH  /api/approval-flows/{id}     (Update)
DELETE /api/approval-flows/{id}     (Delete)

GET    /api/approval-flows/{id}/rules    (Nested resource)
POST   /api/approval-flows/{id}/rules    (Create nested)

❌ WRONG:
GET /api/getApprovalFlows
POST /api/createApprovalFlow
GET /api/approval_flows
```

### Response Format
```json
// ✅ CORRECT: Consistent JSON structure
{
  "data": {
    "id": 1,
    "flow_name": "High Value Travel",
    "match_type": "ALL",
    "rules": [...]
  }
}

// List responses
{
  "data": [...],
  "meta": {
    "total": 10,
    "per_page": 15,
    "current_page": 1
  }
}

// Error responses
{
  "error": "Validation Error",
  "message": "The flow name field is required",
  "errors": {
    "flow_name": ["The flow name field is required"]
  }
}
```

### HTTP Status Codes
```
✅ Use appropriate codes:
200 OK              - GET/PATCH successful
201 Created         - POST successful
204 No Content      - DELETE successful
400 Bad Request     - Invalid data
401 Unauthorized    - Not authenticated
403 Forbidden       - Not authorized
404 Not Found       - Resource doesn't exist
422 Unprocessable   - Validation error
500 Server Error    - Something broke
```

---

## 📝 Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
```
feat     - New feature
fix      - Bug fix
docs     - Documentation only
style    - Formatting, missing semicolons, etc.
refactor - Code change that neither fixes a bug nor adds a feature
test     - Adding tests
chore    - Updating build tasks, package manager configs, etc.
```

### Examples
```
✅ GOOD:
feat(approval-flow): add drag-and-drop step reordering

Implemented drag-and-drop functionality for approval flow steps
using native HTML5 drag events. Steps auto-renumber when reordered.

Closes #123

fix(auth): resolve sanctum cookie not being set

Changed axios withCredentials to true to ensure sanctum cookies
are properly sent with requests.

docs(database): update schema with approval flow tables

refactor(services): extract rule evaluation to separate class

Moved rule evaluation logic from ApprovalFlowService to new
RuleEvaluatorService for better separation of concerns.

❌ BAD:
updated stuff
fixed bug
changes
wip
```

### Branch Naming
```
✅ CORRECT:
feature/approval-flow-admin
fix/sanctum-authentication
refactor/service-layer
docs/api-documentation

❌ WRONG:
my-branch
updates
branch1
```

---

## 📁 File Organization

### Backend Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── ApprovalFlowController.php
│   │   │   ├── ApprovalFlowRuleController.php
│   │   │   └── ApprovalFlowStepController.php
│   │   └── AuthController.php
│   ├── Middleware/
│   ├── Requests/
│   │   ├── StoreApprovalFlowRequest.php
│   │   └── UpdateApprovalFlowRequest.php
│   └── Resources/
│       ├── ApprovalFlowResource.php
│       └── ApprovalFlowCollection.php
├── Models/
│   ├── ApprovalFlow.php
│   ├── ApprovalFlowRule.php
│   └── ApprovalFlowStep.php
├── Services/
│   ├── ApprovalFlowService.php
│   └── RuleEvaluatorService.php
└── Exceptions/
    └── ApprovalFlowNotFoundException.php
```

### Frontend Structure
```
src/
├── assets/
│   ├── images/
│   └── styles/
│       ├── main.css
│       └── tailwind.css
├── components/
│   ├── approval-flow/
│   │   ├── FlowCard.vue
│   │   ├── FlowList.vue
│   │   ├── RuleForm.vue
│   │   └── StepForm.vue
│   └── common/
│       ├── Button.vue
│       ├── Modal.vue
│       └── Toast.vue
├── views/
│   ├── Login.vue
│   ├── Dashboard.vue
│   └── ApprovalFlowAdmin.vue
├── stores/
│   ├── auth.js
│   ├── approvalFlow.js
│   └── users.js
├── services/
│   ├── api.js
│   ├── authService.js
│   └── flowService.js
├── router/
│   └── index.js
├── utils/
│   ├── helpers.js
│   └── validators.js
└── App.vue
```

---

## 🔒 Security Standards

### Never Trust User Input
```php
// ✅ ALWAYS validate and sanitize
public function store(StoreApprovalFlowRequest $request)
{
    // Request validation already done
    $validated = $request->validated();
    
    // Additional business logic validation
    if ($validated['match_type'] === 'ALL' && empty($validated['rules'])) {
        throw new ValidationException('ALL match type requires at least one rule');
    }
    
    $flow = $this->service->createFlow($validated);
    return new ApprovalFlowResource($flow);
}

// ❌ NEVER trust raw input
public function store(Request $request)
{
    $flow = ApprovalFlow::create($request->all()); // DANGEROUS!
}
```

### SQL Injection Prevention
```php
// ✅ ALWAYS use Eloquent or parameterized queries
$users = User::where('email', $email)->get();
$users = DB::select('SELECT * FROM users WHERE email = ?', [$email]);

// ❌ NEVER concatenate SQL
$users = DB::select("SELECT * FROM users WHERE email = '$email'"); // DANGEROUS!
```

### XSS Prevention
```vue
<!-- ✅ Vue automatically escapes -->
<div>{{ userInput }}</div>

<!-- ❌ Only use v-html for trusted content -->
<div v-html="trustedHtml"></div> <!-- Use sparingly! -->
```

### Environment Variables
```php
// ✅ NEVER commit .env files
// Use .env.example instead

// ✅ Access via env() helper
$apiKey = env('EXTERNAL_API_KEY');

// ❌ NEVER hardcode secrets
$apiKey = 'sk_live_abc123xyz'; // DANGEROUS!
```

---

## ✅ Code Review Checklist

### Before Committing
- [ ] Code follows naming conventions
- [ ] No commented-out code (remove or explain why)
- [ ] No console.log() or dd() in production code
- [ ] All variables have meaningful names
- [ ] Functions are small and single-purpose
- [ ] Added/updated tests if applicable
- [ ] No hardcoded values (use constants/env)
- [ ] Error handling is present
- [ ] Documentation/comments added for complex logic

### Before Pull Request
- [ ] Branch is up to date with main
- [ ] All tests pass
- [ ] No merge conflicts
- [ ] Migrations run successfully
- [ ] API endpoints tested in Postman
- [ ] Frontend functionality tested in browser
- [ ] Code is formatted (Prettier/PHP-CS-Fixer)
- [ ] Commit messages follow standards

---

## 📚 Additional Resources

### PHP/Laravel
- [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
- [PSR-12 Coding Standard](https://www.php-fig.org/psr/psr-12/)

### Vue/JavaScript
- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### Database
- [Database Naming Conventions](https://www.sqlstyle.guide/)

---

**Last Updated:** January 27, 2026  
**Version:** 1.0

---
