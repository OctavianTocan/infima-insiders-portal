# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: contact@octaviantocan.com
3. Include detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

We will acknowledge receipt within 48 hours and provide a detailed response within 5 business days.

## Security Best Practices for Contributors

### Critical: Environment Variables and Secrets

**NEVER commit sensitive files to version control:**

- `.env` - Local environment variables (already gitignored)
- `.env.local` - Local overrides (already gitignored)
- `.env.*` - Environment-specific files (already gitignored)
- `.dev.vars` - Cloudflare Wrangler local secrets (already gitignored)
- `wrangler.jsonc` - Generated configuration (already gitignored)

**Managing secrets:**

```bash
# CORRECT: Use Cloudflare secrets for production
npx wrangler secret put API_KEY
# Or, if you have wrangler installed (npm i -g wrangler):
wrangler secret put API_KEY
```

### Code Security

**Input Validation:**

- Always validate and sanitize user input
- Use TypeScript types and Zod schemas for runtime validation
- Never trust data from external sources (form submissions, API requests)

**Dependencies:**

- Regularly update dependencies to patch security vulnerabilities
- Run `npm audit` before committing changes
- Review dependency changes in pull requests

**CORS Configuration:**

- This application does not require CORS headers as it handles all API interactions server-side
- No cross-origin requests are made from the frontend
- OAuth flows use redirects instead of API calls

**Rate Limiting:**

- Implement rate limiting to prevent abuse
- Monitor Cloudflare Workers analytics for unusual patterns

### Cloudflare-Specific Security

**KV Storage:**

- Never store sensitive personal information without encryption
- Use appropriate TTLs to minimize data retention
- Review KV bindings in wrangler configuration

**API Routes:**

- Validate all incoming requests
- Use appropriate HTTP methods (POST for mutations)
- Return appropriate error codes without exposing internals

**Environment Variables:**

- Use Cloudflare Workers secrets for sensitive values
- Never log environment variables or secrets
- Rotate API keys regularly

## Security Checklist for Pull Requests

Before submitting a PR, verify:

- [ ] No `.env`, `.dev.vars`, or `wrangler.jsonc` files committed
- [ ] No API keys, tokens, or passwords in code or comments
- [ ] Input validation added for any new user-facing endpoints
- [ ] Dependencies updated and `npm audit` clean
- [ ] CORS settings appropriate for environment
- [ ] Error messages don't expose sensitive information
- [ ] No sensitive data logged to console

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

We recommend always using the latest version of this project for the most up-to-date security patches.

## Known Security Considerations

This project handles email addresses and signup data. Please be aware:

- Email addresses are stored in Cloudflare KV
- Data is transmitted to Resend API for email delivery
- Review [Resend's privacy policy](https://resend.com/legal/privacy-policy)
- Review [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/)

## Additional Resources

- [Cloudflare Workers Security Best Practices](https://developers.cloudflare.com/workers/platform/security/)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-features)
