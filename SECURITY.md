# Security Policy & Vulnerability Management

This document defines the security policies, configuration guidelines, and historic vulnerability patches applied to the **n8n Workflows Search Platform**. We are committed to ensuring our workflow catalog remains safe, clean, and secure for self-hosted deployments.

---

## 🔒 Reporting Security Vulnerabilities

If you discover a security vulnerability or identify sensitive exposures in this repository, please **do not open a public GitHub Issue**. Public disclosures expose self-hosted instances of this application to exploitation. 

Instead, report vulnerabilities responsibly by initiating a private [GitHub Security Advisory](https://github.com/aboalrejal-ai/n8n-workflows/security/advisories/new) or emailing the maintainers directly. Our engineering team reviews all disclosures and aims to release security patches within 48 hours.

---

## 🛡️ Applied Security Fixes & Vulnerability Mitigation

We conduct security audits of our core API codebase and workflow database templates. Below is the documentation of our security audits and the remediations applied to protect our users.

### 1. Stripping Hardcoded API Credentials (May 2026 Audit)
*   **Vulnerability Type**: API Secrets Exposure (GitHub Push Protection Trigger)
*   **Exposed Files**: Staged workflow templates `1756_Code_HTTP_Automation_Webhook.json` and `1964_HTTP_Aggregate_Automation_Webhook.json`.
*   **The Issue**: The original files contained raw, hardcoded third-party API credentials, including an active Perplexity API Key and an Apify API Token. This posed a security risk to the original keys and triggered GitHub push protection blocks.
*   **Remediation**: Stripped all active secrets from the workflow templates. Replaced raw credentials with standardized security placeholders (`YOUR_PERPLEXITY_API_KEY_HERE` and `YOUR_APIFY_API_TOKEN_HERE`). Verified that these templates can now be imported safely by self-hosted n8n instances without exposing private keys.

### 2. Mitigating Windows Path Traversal Exploit (Fixed November 2025)
*   **Vulnerability Type**: Path Traversal (CWE-22 / CWE-23)
*   **Historical Issue**: The FastAPI backend was vulnerable to path traversal attacks on Windows operating systems. Attackers could craft custom HTTP requests to retrieve sensitive host files by exploiting differences in Windows directory separator styles.
*   **Remediation**: Implemented a defense-in-depth security function `validate_filename()` in our API layer:
    *   Enforces input sanitization to block parent directory escape sequences (`..`), Windows drive letter mappings, and wildcard characters.
    *   Leverages `Path.resolve()` and checks constraints with `.relative_to()` to ensure file read streams never escape the sandbox directory.

### 3. Restricting CORS Access Controls (Fixed & Reconfigured May 2026)
*   **Vulnerability Type**: Insecure CORS Origin Configuration (CWE-942)
*   **The Issue**: Previously, CORS configurations allowed wildcard origins or referenced outdated domains, potentially letting malicious third-party sites access backend APIs on behalf of users.
*   **Remediation**: Tightened CORS middlewares in FastAPI to authorize only:
    *   Verified local system ports for staging and development (`localhost:3000`, `localhost:8000`, `localhost:8080`).
    *   Our official GitHub Pages production frontend (`https://aboalrejal-ai.github.io`).
    *   Explicitly constrained HTTP methods to `GET` and `POST`, and permitted headers specifically to `Content-Type` and `Authorization`.

### 4. Authenticating Administrative Reindex Endpoints (Fixed November 2025)
*   **Vulnerability Type**: Missing Endpoint Authentication (CWE-306)
*   **The Issue**: The `/api/reindex` route (used to refresh the SQLite FTS5 database) could be invoked by any remote client. An attacker could trigger constant database write loops, leading to high CPU usage and a Denial of Service (DoS) condition.
*   **Remediation**: Added secure token verification:
    *   The `/api/reindex` endpoint now enforces the presence of an `admin_token` query parameter.
    *   The API validates the token against the cryptographically secure `ADMIN_TOKEN` environment variable.
    *   Added dedicated rate-limiting and audit log checks that record the IP addresses of all reindexing attempts.

### 5. API Rate-Limiting Protection (Added Security Feature)
*   **Vulnerability Type**: Rate Limiting / Denial of Service Defense
*   **Remediation**: Implemented a fast, memory-efficient rate-limiter:
    *   Constrains all public client IPs to a maximum of 60 requests per minute on sensitive routes.
    *   Instantly rejects traffic spikes with clean HTTP 429 (Too Many Requests) responses, protecting backend resources from abuse.

---

## ⚙️ Secure Environment Configuration

### Required Environment Variables

Secure your self-hosted API container by declaring these variables in your deployment environment:

```bash
# Secure Token: Required to authorize calls to the SQLite reindex API
export ADMIN_TOKEN="generate-a-secure-random-64-character-token"

# Optional: Tune request rate limits per IP (default: 60)
export MAX_REQUESTS_PER_MINUTE=60
```

### CORS Security Origins Setup
To add authorized origins, append domain strings to the `ALLOWED_ORIGINS` array within `api_server.py`:

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://your-production-domain.com",  # Authorize your custom production domain here
]
```

---

## 📋 Security Operations Best Practices

To maintain a secure self-hosted automation infrastructure, we recommend implementing these guidelines:

1.  **Protect Administrative Tokens**: Never commit your `ADMIN_TOKEN` or other keys to version control. Use secure environment file structures or container secrets.
2.  **Enforce Strict HTTPS**: Block unencrypted HTTP connections in production. Ensure that SSL termination occurs at your reverse proxy layer.
3.  **Regular Vulnerability Scans**: Run security sweeps on your local container deployments (e.g., using Trivy or Snyk) to identify outdated base image vulnerabilities.
4.  **Isolate Database Volume**: Restrict write permissions on the `database/` directory to only the dedicated non-root application user running the container.
5.  **Audit System Logs**: Stream API access logs to a centralized monitoring system to flag anomalous request spikes or reindexing attempts.

---

## 🚀 Production Deployment Security Checklist

Run through this checklist before making your self-hosted workflows platform accessible to the public:
*   [ ] Configure a unique, cryptographically random `ADMIN_TOKEN`.
*   [ ] Verify `ALLOWED_ORIGINS` contains only your trusted domains.
*   [ ] Terminate SSL connections and enable HTTP-to-HTTPS redirect rules.
*   [ ] Deploy the container process under a non-root system user.
*   [ ] Enable IP rate-limiting to prevent automated crawlers from exhausting server memory.
*   [ ] Place the SQLite database volume behind strict file system permissions.
*   [ ] Configure security headers on your reverse proxy (Traefik, Nginx, or Caddy).

---

## 🔒 Recommended Reverse Proxy Security Headers (Nginx Example)

If you run the application behind an Nginx reverse proxy, add these security headers to prevent common exploits like Clickjacking and cross-site scripting:

```nginx
# Nginx Security Server Configuration Block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## 📈 Security Disclosure & Patching Timeline

| Date | Identified Vulnerability | Remediation Status | Resolved In Version |
|:---|:---|:---|:---:|
| **Oct 2025** | Windows Path Traversal Vulnerability (#48) | Implemented filename sanitization and resolved path boundaries. | `v2.0.1` |
| **Nov 2025** | Weak CORS Policy Alignment | Restricted CORS access to localized and verified origins. | `v2.0.1` |
| **Nov 2025** | Unauthenticated Database Reindex Endpoint | Enforced secure administrative token checks and rate limiting. | `v2.0.1` |
| **May 2026** | Hardcoded Credentials in Template files | Stripped API tokens and replaced with standardized placeholders. | `v2.0.2` |
| **May 2026** | CORS domain update for new publisher | Updated allowed origins to authorize `aboalrejal-ai` workspace. | `v2.0.2` |

---

## Credits & Attributions

We thank the global open-source community for helping audit and secure this library:
*   **Path Traversal Discovery**: Reported securely by community contributors via GitHub Issue #48.

---

## Contact maintainers
For private inquiries, licensing details, or security concerns, contact maintainer [Mohammed Nadhir Abo Alrejal](https://github.com/aboalrejal-ai).