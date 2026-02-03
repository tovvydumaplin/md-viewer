# 📊 Model Inventory & Roadmap

## ✅ Completed APIs (4)
- **User**
- **Company**
- **Site**
- **Department**

---

## 🔧 Phase 1: Basic CRUD APIs (Do These Next)

### Priority Order
1. **Position**  
   _Simple – similar to Department + `rank_id`_

2. **Module**  
   _Simple – fields:_
   - `name`
   - `description`
   - `icon`
   - `is_active`

3. **Permission**  
   _Simple – fields:_
   - `name`
   - `description`

4. **Role**  
   _Medium – fields:_
   - `name`
   - `description`
   - `rank_level`
   - `is_active`

⏱ **Estimated Time:**  
**1–2 days** if you keep your current pace 🚀

---

## 🔐 Phase 2: Authentication & Authorization  
_(After Basic APIs)_

### 🔑 Auth System
- Login / Logout endpoints
- Laravel Sanctum (token-based authentication)
- Protected routes using middleware

### 🛂 Role–Permission Management (Special Endpoints)
- `POST /api/roles/{id}/permissions`  
  _Attach permissions to role_

- `GET /api/roles/{id}/permissions`  
  _List role permissions_

- `DELETE /api/roles/{id}/permissions/{permissionId}`  
  _Detach permission from role_

### 👤 User Permission Override (Advanced)
- Override specific permissions per user
- Uses **UserPermissionOverride** model (already exists)

---

## 📝 Phase 3: Approval System  
_(Complex – After Auth)_

### 🔄 Approval Flow API
- Workflow templates
- Rules (`ApprovalFlowRule` model)
- Steps (`ApprovalFlowStep` model)

### ✅ Approval Execution API
- Create approval requests
- Approve / Reject actions
- Approval status tracking

---

## 🎯 Next Steps

### Today / Tomorrow Plan
- ✅ **Position API**  
  _~10 min (copy Department logic)_

- ✅ **Module API**  
  _~15 min (simple CRUD)_

- ✅ **Permission API**  
  _~15 min (simple CRUD)_

- ✅ **Role API**  
  _~20 min (extra fields involved)_

➡️ **Then:**  
**Authentication → RBAC → Approval System**
