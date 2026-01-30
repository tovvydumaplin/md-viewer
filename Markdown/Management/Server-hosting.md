# Hosting Infrastructure Proposal
**Project:** IRPMI System  
**Prepared by:** IT  
**Date:** January 30, 2026

---

## 1. Overview

This proposal evaluates two **Hostinger Cloud Hosting plans** to support an internal business system built with:

- **Backend:** Laravel (REST API)
- **Frontend:** Vue.js (SPA)
- **Database:** MySQL / PostgreSQL
- **Use Case:** Internal operations (approvals, records, dashboards, audit logs)

The goal is to select a plan that balances **performance, scalability, reliability, cost-efficiency, and security** for an internal organizational system.

---

## 2. System Requirements Summary

The platform is expected to support:

- Concurrent internal users during peak office hours
- CRUD-heavy business workflows
- Role-based access control (RBAC)
- Approval workflows
- Audit logging
- API-driven frontend architecture
- Background jobs (emails, reports, notifications)

Laravel + Vue is well-suited for this workload when paired with sufficient CPU, memory, and PHP workers.

---

## 3. Hosting Options Comparison

### Option A: **Cloud Enterprise**

**Description:** Maximum performance for high-demand websites and applications.

**Resources**
- 6 CPU cores
- 12 GB RAM
- 300 GB NVMe storage
- 4,000,000 inodes
- 300 PHP workers
- Up to 100 websites
- Up to 10 Node.js web apps

**Pricing**
- ₱1,289.00 / month (48 months)
- Renewal: ₱3,529.00 / month (annual)
- Cancel anytime
- **Total (48 months): ₱61,872.00**

**Pros**
- High performance headroom
- Excellent for heavy background jobs and reporting
- Strong future-proofing
- Very high PHP worker capacity

**Cons**
- Higher cost

---

### Option B: **Cloud Professional**

**Description:** Optimized for scaling professional websites and applications.

**Resources**
- 4 CPU cores
- 6 GB RAM
- 200 GB NVMe storage
- 3,000,000 inodes
- 200 PHP workers
- Up to 100 websites
- Up to 10 Node.js web apps

**Pricing**
- ₱609.00 / month (48 months)
- Renewal: ₱2,239.00 / month (annual)
- Cancel anytime
- **Total (48 months): ₱29,232.00**

**Pros**
- Cost-efficient
- Strong performance for internal systems
- Suitable for API-driven Laravel + Vue applications
- Lower long-term cost commitment

**Cons**
- Less headroom compared to Cloud Enterprise
- May require upgrade if system scope expands significantly

---

## 4. Performance Suitability

Based on typical internal usage patterns:
- Traffic is **bursty rather than constant**
- Most operations are database-driven
- Peak concurrency is manageable with proper caching and queues

Both plans can comfortably support:
- Authentication and authorization
- API calls from a Vue SPA
- Background job processing
- Audit logging and approval workflows

---

## 5. Security Considerations

Security is a critical component of the proposed system and hosting environment. Both hosting options provide a suitable foundation for implementing layered security controls at the application and infrastructure levels.

### Application-Level Security
- **Authentication and Authorization:**  
  Secure authentication mechanisms and role-based access control (RBAC) enforced at the application layer.
- **API Protection:**  
  Controlled access to REST APIs using secure authentication methods, request validation, and rate limiting.
- **Input Validation and Data Handling:**  
  Server-side validation to protect against common web vulnerabilities and unauthorized data manipulation.
- **Audit Logging:**  
  Logging of critical system actions to support traceability, monitoring, and internal review.

### Infrastructure and Hosting Security
- **Managed Server Environment:**  
  The hosting provider manages underlying server maintenance, updates, and baseline security hardening.
- **Network Security:**  
  Firewall protections and network-level safeguards reduce exposure to unauthorized access.
- **Resource Isolation:**  
  Dedicated resource allocation minimizes the risk of interference between hosted applications.
- **Secure Storage:**  
  Controlled access to NVMe storage for application data and uploaded files.

### Operational Security Practices
- **Environment Separation:**  
  Logical separation of development, staging, and production environments.
- **Credential Management:**  
  Secure handling of environment variables and system credentials.
- **Backup and Recovery:**  
  Regular backups and defined recovery procedures to support business continuity.

The overall security posture will depend on proper configuration, monitoring, and ongoing operational practices in addition to hosting capabilities.

---

## 6. Conclusion

Both **Cloud Professional** and **Cloud Enterprise** are capable of supporting an internal organizational system built with **Laravel + Vue + REST API**.

- **Cloud Professional** provides a cost-efficient option that meets current operational requirements and offers sufficient resources for standard internal workloads.
- **Cloud Enterprise** delivers higher resource capacity and additional headroom, making it suitable for scenarios involving heavier processing, increased background jobs, or future system consolidation.

The final selection should be based on the organization’s expected growth, workload complexity, and long-term infrastructure strategy. Either option allows for scalability, with the flexibility to upgrade as system demands evolve.

---
