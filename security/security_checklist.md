# CCIRS Security Checklist

## Day 1 — Initial Security Baseline

### 1. Repository Security
- [x] GitHub repository is private.
- [x] Python .gitignore is configured.
- [x] `.env` is included in .gitignore.
- [x] Private key files (`*.key`, `*.pem`) are ignored.

### 2. Initial Secret Exposure Check
- [x] Searched for `password`.
- [x] Searched for `secret`.
- [x] Searched for `API_KEY`.
- [x] Searched for `SECRET_KEY`.
- [x] No actual secrets identified in the reviewed search results.

### 3. Security Practices to Verify During Development
- [ ] No hardcoded passwords or API keys.
- [ ] Sensitive configuration stored outside source code.
- [ ] Passwords securely hashed.
- [ ] User input validated on the server.
- [ ] SQL queries use parameterized statements.
- [ ] Authentication and authorization tested.
- [ ] Role-Based Access Control (RBAC) enforced.
- [ ] IDOR vulnerabilities tested.

## Status

Day 1 initial security baseline is in progress.

**Security Lead:** Arwa Shoaib
**Project:** Campus Complaint & Issue Reporting System (CCIRS)