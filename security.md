# SECURITY.md

# Learnify Security Standards

This document defines the mandatory security requirements for the Learnify Learning Management System.

These rules apply to every feature, component, API, database query, authentication flow, file upload, and third-party integration.

If a requested implementation conflicts with this document, stop and explain the conflict before generating code.

---

# Core Principles

Always prioritize:

- Confidentiality
- Integrity
- Availability
- Least Privilege
- Defense in Depth
- Secure by Default
- Fail Securely

Never trade security for convenience.

---

# Authentication

Use secure authentication at all times.

Passwords must never be stored in plaintext.

Passwords must always be hashed using a modern password hashing algorithm.

Authentication must support the Learnify user roles:

- Student
- Instructor
- Administrator

Sessions must expire.

Use secure session handling.

Use HttpOnly cookies.

Use Secure cookies.

Use SameSite protection.

Never expose authentication tokens to client-side JavaScript.

Never hardcode authentication secrets.

---

# Authorization

Every protected request must verify permissions.

Never trust the frontend.

Never trust client-provided roles.

Implement Role Based Access Control (RBAC).

Students can only access their own data.

Instructors can only modify their own courses and lectures.

Administrators have elevated permissions.

Ownership must always be validated on the server.

---

# API Security

Every API endpoint must:

- Authenticate the user when required
- Authorize the user
- Validate the request
- Sanitize input
- Return appropriate HTTP status codes

Never expose:

- Stack traces
- Database errors
- Internal implementation details

Use consistent error responses.

---

# Input Validation

Validate every input.

Never trust user input.

Validate:

- Required fields
- Data types
- Length
- Range
- Format

Reject unexpected fields.

Escape all rendered user content.

Prevent:

- XSS
- SQL Injection
- NoSQL Injection
- Command Injection
- Template Injection

---

# Output Encoding

Always encode user-generated content before rendering.

Never render raw HTML unless it is explicitly sanitized and approved.

Prevent Cross Site Scripting (XSS).

---

# File Upload Security

Only allow approved file types.

Validate:

- MIME type
- File extension
- File size

Rename uploaded files.

Never trust original filenames.

Store uploads outside the public directory.

Reject executable files.

Reject dangerous extensions.

Scan uploaded files before processing when possible.

---

# Database Security

Use parameterized queries.

Never concatenate SQL strings.

Use the ORM safely.

Never expose database credentials.

Use least-privilege database access only.

Validate ownership before reading or updating records.

---

# Secrets

Never hardcode:

- API keys
- JWT secrets
- Database passwords
- SMTP credentials
- OAuth secrets

Use environment variables.

Never commit secrets to Git.

---

# Logging

Log:

- Login attempts
- Registration
- Password changes
- Permission changes
- Admin actions
- Course purchases
- Payment events

Never log:

- Passwords
- Tokens
- Secrets
- Payment card data

Logs must not expose sensitive information.

---

# Rate Limiting

Protect:

- Login
- Registration
- Password reset
- OTP verification
- Public APIs

Throttle repeated requests.

Prevent brute force attacks.

---

# CSRF Protection

State-changing operations must be protected against CSRF.

Use secure anti-CSRF mechanisms where applicable.

---

# Security Headers

Enable:

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Disable unnecessary browser features.

---

# HTTPS

Always require HTTPS.

Never send authentication information over HTTP.

Redirect HTTP to HTTPS.

---

# Dependencies

Use maintained packages only.

Avoid abandoned libraries.

Regularly update dependencies.

Remove unused packages.

Do not introduce unnecessary dependencies.

---

# Error Handling

Show user-friendly messages.

Never expose:

- Stack traces
- SQL errors
- Internal paths
- Server configuration

Log detailed errors only on the server.

---

# Payment Security

Never store payment card information.

Use trusted payment providers only.

Validate payment callbacks.

Verify webhook signatures.

---

# Privacy

Collect only required user information.

Protect personal information.

Follow data minimization principles.

---

# Access Control

Every protected page must verify:

- Authentication
- Authorization
- Ownership

Never rely on hidden buttons or hidden routes.

---

# Security Reviews

Before implementing any feature, verify:

- Authentication
- Authorization
- Validation
- Error handling
- Logging
- Input sanitization

---

# OWASP Compliance

Follow OWASP Top 10 recommendations.

Protect against:

- Broken Access Control
- Cryptographic Failures
- Injection
- Insecure Design
- Security Misconfiguration
- Vulnerable Components
- Authentication Failures
- Software Integrity Failures
- Logging Failures
- SSRF

---

# AI Development Rules

Claude must never:

- Generate insecure authentication
- Disable validation
- Bypass authorization
- Hardcode secrets
- Ignore ownership checks
- Remove security middleware
- Disable HTTPS
- Expose sensitive data

If a requested implementation violates these rules:

STOP.

Explain why.

Suggest the secure implementation instead.

---

# Definition of Done

A feature is not complete until:

- Authentication is verified
- Authorization is verified
- Input is validated
- Output is encoded
- Secure error handling is implemented
- Logging is implemented
- Security headers are preserved
- No secrets are exposed
- OWASP risks are considered

Security is mandatory for every feature.