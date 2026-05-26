# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly by emailing the maintainers directly. Do not create public issues for security vulnerabilities.

## Security Fixes & Cleanups (May 2026)

### 1. Hardcoded Credentials Cleanup (Fixed May 2026)
- **Issue**: Staged template files contained raw hardcoded secrets (including a Perplexity API Key and an Apify API Token) which triggered GitHub Push Protection blocks and risked exposing live keys in public source code.
- **Fix Applied**: Stripped all active credentials from JSON templates (`1756_Code_HTTP_Automation_Webhook.json` and `1964_HTTP_Aggregate_Automation_Webhook.json`) and replaced them with secure placeholders (`YOUR_PERPLEXITY_API_KEY_HERE` and `YOUR_APIFY_API_TOKEN_HERE`), allowing secure deployment.

### 2. Path Traversal Vulnerability (Fixed November 2025)
**Issue #48**: Previously, the API server was vulnerable to path traversal attacks on Windows systems.

**Fix Applied**:
- Added comprehensive filename validation with `validate_filename()` function
- Blocks all path traversal patterns including parent directory references (`..`), drive letters, and special characters
- Uses `Path.resolve()` and `relative_to()` for defense in depth

### 3. CORS Misconfiguration (Fixed & Reconfigured May 2026)
**Previously**: CORS allowed arbitrary origins or pointed to the old repository domain.

**Fix Applied**:
- Restricted CORS origins to specific allowed domains:
  - Local development ports (3000, 8000, 8080)
  - GitHub Pages (`https://aboalrejal-ai.github.io`)
- Restricted allowed methods to only `GET` and `POST`
- Restricted allowed headers to `Content-Type` and `Authorization`

### 4. Unauthenticated Reindex Endpoint (Fixed November 2025)
**Previously**: The `/api/reindex` endpoint could be called by anyone, potentially causing DoS.

**Fix Applied**:
- Added authentication requirement via `admin_token` query parameter
- Token must match `ADMIN_TOKEN` environment variable
- Added rate limiting to prevent abuse
- Logs all reindex attempts with client IP

### 4. Rate Limiting (Added)
**New Security Feature**:
- Implemented rate limiting (60 requests per minute per IP)
- Applied to all sensitive endpoints
- Prevents brute force and DoS attacks
- Returns HTTP 429 when limit exceeded

## Security Configuration

### Environment Variables
```bash
# Required for reindex endpoint
export ADMIN_TOKEN="your-secure-random-token"

# Optional: Configure rate limiting (default: 60)
# MAX_REQUESTS_PER_MINUTE=60
```

### CORS Configuration
To add additional allowed origins, modify the `ALLOWED_ORIGINS` list in `api_server.py`:

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://your-domain.com",  # Add your production domain
]
```

## Security Best Practices

1. **Environment Variables**: Never commit sensitive tokens or credentials to the repository
2. **HTTPS Only**: Always use HTTPS in production (HTTP is only for local development)
3. **Regular Updates**: Keep all dependencies updated to patch known vulnerabilities
4. **Monitoring**: Monitor logs for suspicious activity patterns
5. **Backup**: Regular backups of the workflows database

## Security Checklist for Deployment

- [ ] Set strong `ADMIN_TOKEN` environment variable
- [ ] Configure CORS origins for your specific domain
- [ ] Use HTTPS with valid SSL certificate
- [ ] Enable firewall rules to restrict access
- [ ] Set up monitoring and alerting
- [ ] Review and rotate admin tokens regularly
- [ ] Keep Python and all dependencies updated
- [ ] Use a reverse proxy (nginx/Apache) with additional security headers

## Additional Security Headers (Recommended)

When deploying behind a reverse proxy, add these headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

## Vulnerability & Security Disclosure Timeline

| Date | Issue | Status | Fixed Version |
|------|-------|--------|---------------|
| Oct 2025 | Path Traversal (#48) | Fixed | 2.0.1 |
| Nov 2025 | CORS Misconfiguration | Fixed | 2.0.1 |
| Nov 2025 | Unauthenticated Reindex | Fixed | 2.0.1 |
| May 2026 | Hardcoded Secrets in JSON templates | Cleaned & Replaced | 2.0.2 |
| May 2026 | CORS Domain update (`aboalrejal-ai`) | Reconfigured | 2.0.2 |

## Credits

Security issues reported by:
- Path Traversal: Community contributor via Issue #48

## Contact

For security concerns, please contact the maintainers privately.