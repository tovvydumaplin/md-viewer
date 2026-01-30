# Tech Stack & Project Plan

**Project:** IRPMI Platform
**Date:** January 27, 2026  
**Author:** Tovvy Dumaplin
**Architecture:** REST API + SPA
**Repositories:**
- Frontend: `irpmi-frontend`
- Backend: `irpmi-backend`

---

## 📚 Complete Tech Stack

### Frontend Stack
```
✅ Vue 3 (SPA Framework)
✅ Vue Router (Navigation)
✅ Axios (HTTP Client for API calls)
✅ Pinia (State Management - Recommended)
✅ Tailwind CSS (Styling)
✅ Vite (Build Tool - included with Vue)
```

### Backend Stack
```
✅ Laravel 10/11 (API Framework)
✅ PHP 8.2+
✅ Sanctum (Authentication)
✅ MySQL 8.0+ (Database)
✅ Composer (PHP Package Manager)
```

### Development Tools
```
✅ Postman (API Testing)
✅ Git + GitHub (Version Control)
✅ VS Code or PhpStorm (IDE)
✅ Node.js 18+ + NPM (Frontend build)
✅ Laragon/XAMPP (Local Development Server)
✅ Laravel Debugbar (Development Debugging)
```

---

## 🏗️ Architecture

### API Communication
- **Type:** REST API
- **Format:** JSON
- **Authentication:** Cookie-based (Sanctum for SPA)
- **CORS:** Configured for localhost development

### Data Flow
```
Vue 3 SPA (Frontend)
    ↓ (Axios HTTP Requests)
Laravel API (Backend)
    ↓ (Eloquent ORM)
MySQL Database
```

---

## 📁 Project Structure

### Backend Repository (irpmi-backend)
```
irpmi-backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Services/
│   │   │   └── ApprovalFlowService.php
│   │   └── Actions/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── .env
│   └── composer.json
```

### Frontend Repository (irpmi-frontend)
```
irpmi-frontend/                   # Vue 3 SPA
    ├── src/
    │   ├── assets/               # Images, fonts, etc.
    │   ├── components/           # Reusable Vue components
    │   ├── views/                # Page components
    │   │   ├── Login.vue
    │   │   ├── Dashboard.vue
    │   │   ├── ApprovalFlowAdmin.vue
    │   │   ├── UserManagement.vue
    │   │   └── ModuleManagement.vue
    │   ├── router/
    │   │   └── index.js          # Vue Router config
    │   ├── stores/               # Pinia stores
    │   │   ├── auth.js
    │   │   ├── approvalFlow.js
    │   │   └── users.js
    │   ├── services/             # Axios API calls
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── flowService.js
    │   │   └── userService.js
    │   ├── App.vue
    │   └── main.js
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🔧 Installation & Setup

### Backend Setup (Laravel)

```bash
# 1. Create Laravel project
composer create-project laravel/laravel irpmi-backend

# 2. Install Sanctum
cd irpmi-backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 3. Configure database (.env)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=irpmi_system
DB_USERNAME=root
DB_PASSWORD=

# 4. Configure Sanctum for SPA (.env)
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1

# 5. Run migrations
php artisan migrate

# 6. Install Laravel Debugbar (dev)
composer require barryvdh/laravel-debugbar --dev

# 7. Start development server
php artisan serve
```

### Frontend Setup (Vue 3)

```bash
# 1. Create Vue project
npm create vite@latest frontend -- --template vue

# 2. Install dependencies
cd frontend
npm install

# 3. Install additional packages
npm install vue-router pinia axios

# 4. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Configure Tailwind (tailwind.config.js)
content: [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}",
]

# 6. Start development server
npm run dev
```

---

## 🚀 Development Workflow

### Phase 1: Core Backend (Week 1-2)
```
✅ Database migrations
   - users, roles, departments
   - modules
   - approval_flow, approval_flow_rules, approval_flow_steps
   - approvals (runtime)

✅ Models & Relationships
   - User, Role, Department, Module
   - ApprovalFlow, ApprovalFlowRule, ApprovalFlowStep, Approval

✅ Authentication
   - Sanctum setup
   - Login/Logout API
   - User session management

✅ Basic CRUD APIs
   - User Management
   - Module Management
```

### Phase 2: Approval Flow System (Week 3-4)
```
✅ Approval Flow CRUD
   - Create, Read, Update, Delete flows
   - Manage rules
   - Manage steps

✅ Business Logic
   - ApprovalFlowService (flow resolution)
   - RuleEvaluator (rule evaluation)
   - Dynamic field mapping

✅ API Endpoints
   - GET/POST/PATCH/DELETE /api/approval-flows
   - GET/POST/PATCH/DELETE /api/approval-flows/{id}/rules
   - GET/POST/PATCH/DELETE /api/approval-flows/{id}/steps
```

### Phase 3: Frontend Development (Week 5-6)
```
✅ Authentication Pages
   - Login
   - Logout
   - Session management

✅ Admin Pages
   - Dashboard
   - User Management
   - Module Management
   - Approval Flow Admin (UI we built)

✅ API Integration
   - Axios service setup
   - API calls to Laravel
   - Error handling
```

### Phase 4: Approval Processing (Week 7-8)
```
✅ Request Submission
   - Submit travel request / other modules
   - Resolve approval flow
   - Create approval instances

✅ Approval Actions
   - Approve/Reject
   - Comments
   - Notifications

✅ Approval Tracking
   - View pending approvals
   - Approval history
   - Status updates
```

---

## 📊 Database Schema

### Core Tables
```sql
users
roles
departments
modules
approval_flow
approval_flow_rules
approval_flow_steps
approvals
```

**Refer to:** `DATABASE-SCHEMA.md` for detailed schema

---

## 🔐 Authentication Flow (Sanctum)

### SPA Authentication
```javascript
// 1. Get CSRF Cookie
await axios.get('/sanctum/csrf-cookie')

// 2. Login
await axios.post('/login', { email, password })
// → Sets HTTP-only cookie

// 3. Authenticated Requests
await axios.get('/api/user')
// → Cookie automatically sent

// 4. Logout
await axios.post('/logout')
```

### Laravel API Routes
```php
// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn() => auth()->user());
    Route::apiResource('approval-flows', ApprovalFlowController::class);
});
```

---

## 🧪 Testing Strategy

### Backend Testing
```bash
# PHPUnit
php artisan test

# Test files
tests/Feature/ApprovalFlowTest.php
tests/Unit/RuleEvaluatorTest.php
```

### API Testing
```
✅ Postman Collections
   - Authentication
   - User Management
   - Approval Flows
   - Approval Processing
```

### Frontend Testing (Optional)
```bash
# Vitest
npm run test
```

---

## � Git Version Control Workflow

### Repository Setup
```bash
# Clone repository
git clone https://github.com/your-org/irpmi-platform.git
cd irpmi-platform

# Repository structure
irpmi-platform/
├── irpmi-backend/     # Laravel API
├── irpmi-frontend/    # Vue 3 SPA
├── .gitignore
└── README.md
```

### Daily Workflow

#### Before Starting Work
```bash
# Always pull latest changes first!
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
# Examples:
# git checkout -b feature/approval-flow-api
# git checkout -b feature/user-management-ui
# git checkout -b fix/login-validation
```

#### During Development
```bash
# Check status frequently
git status

# Stage specific files
git add irpmi-backend/app/Http/Controllers/ApprovalFlowController.php
git add irpmi-frontend/src/views/Dashboard.vue

# Or stage all changes
git add .

# Commit with clear messages
git commit -m "feat: add approval flow CRUD API"
git commit -m "fix: resolve login redirect issue"
git commit -m "style: update dashboard layout"

# Commit message conventions:
# feat: new feature
# fix: bug fix
# style: UI/CSS changes
# refactor: code restructure
# docs: documentation
# test: add tests
```

#### Pushing Changes
```bash
# Push your feature branch
git push origin feature/your-feature-name

# First time pushing a new branch
git push -u origin feature/your-feature-name
```

#### Keeping Branch Updated
```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main

# Or use rebase (cleaner history)
git checkout feature/your-feature-name
git pull --rebase origin main
```

### Pull Requests
```bash
# After pushing feature branch:
# 1. Go to GitHub repository
# 2. Create Pull Request from your feature branch to main
# 3. Add description of changes
# 4. Request review from team
# 5. Merge after approval
```

### Common Commands Quick Reference
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "your message"

# Push changes
git push origin branch-name

# View branches
git branch -a

# Switch branches
git checkout branch-name

# Create new branch
git checkout -b new-branch-name

# Discard local changes (be careful!)
git checkout -- filename
git reset --hard HEAD

# View commit history
git log --oneline
```

### .gitignore Configuration
```gitignore
# Backend (Laravel)
irpmi-backend/.env
irpmi-backend/vendor/
irpmi-backend/node_modules/
irpmi-backend/storage/*.key
irpmi-backend/storage/logs/*.log
irpmi-backend/bootstrap/cache/*.php

# Frontend (Vue)
irpmi-frontend/node_modules/
irpmi-frontend/dist/
irpmi-frontend/.env.local
irpmi-frontend/.env.*.local

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# OS
.DS_Store
Thumbs.db
```

### Best Practices
- ✅ **Always pull before starting work**
- ✅ **Commit frequently with clear messages**
- ✅ **Use feature branches (never push directly to main)**
- ✅ **Keep commits focused (one feature/fix per commit)**
- ✅ **Pull request before merging to main**
- ✅ **Review code before committing**
- ❌ **Never commit .env files**
- ❌ **Never commit node_modules/ or vendor/**
- ❌ **Never force push to main branch**

---

## �📝 API Documentation

### Base URL
```
Development: http://localhost:8000/api
```

### Key Endpoints

#### Authentication
```
POST /login
POST /logout
GET /user
```

#### Approval Flows
```
GET    /approval-flows           # List all flows
POST   /approval-flows           # Create flow
GET    /approval-flows/{id}      # Get flow details
PATCH  /approval-flows/{id}      # Update flow
DELETE /approval-flows/{id}      # Delete flow
```

#### Rules
```
GET    /approval-flows/{id}/rules
POST   /approval-flows/{id}/rules
PATCH  /rules/{id}
DELETE /rules/{id}
```

#### Steps
```
GET    /approval-flows/{id}/steps
POST   /approval-flows/{id}/steps
PATCH  /steps/{id}
DELETE /steps/{id}
```

---

## 🎯 Core Features

### Completed Design
- ✅ Approval Flow Administration UI
- ✅ Dynamic rule-based flow resolution
- ✅ Flow-level match type (ALL/ANY)
- ✅ Flexible operators (>, >=, <, <=, =, !=)
- ✅ Dynamic approver types
- ✅ Drag-and-drop step ordering

### To Be Implemented
- ⏳ User Management
- ⏳ Module Management
- ⏳ Approval Submission
- ⏳ Approval Processing
- ⏳ Notifications
- ⏳ Reports & Analytics

---

## 📚 Resources

### Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Axios Documentation](https://axios-http.com/)

### Related Files
- `DATABASE-SCHEMA.md` - Complete database schema
- `RBAC-DATA-FLOW.md` - RBAC system flow
- `approval-flow-admin-demo-v2.html` - UI prototype

---

## ⚠️ Important Notes

### Field Naming Convention
**CRITICAL:** Field names in rules MUST match request data keys exactly!
```
✅ CORRECT: field = "user_id" → matches $requestData["user_id"]
❌ WRONG:   field = "userId"  → won't match $requestData["user_id"]
```
**Use snake_case consistently!**

### Service Architecture
**DO NOT put business logic in Controllers!**
```php
✅ CORRECT: Controller → Service → Model
❌ WRONG:   Controller → Model (business logic in controller)
```

### Security
- Use Sanctum for authentication (NOT JWT)
- Cookie-based auth for SPA (more secure)
- CSRF protection enabled
- Validate all inputs
- Sanitize output

---

**Last Updated:** January 27, 2026  
**Version:** 1.0
