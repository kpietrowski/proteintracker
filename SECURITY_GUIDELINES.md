# 🔐 SECURITY GUIDELINES - CRITICAL

## ⚠️ NEVER HARDCODE API KEYS OR SECRETS

### STRICT RULES:
1. **NEVER** hardcode API keys directly in source code files
2. **NEVER** commit API keys to version control
3. **NEVER** put real API keys in `app.json` or any public configuration files
4. **ALWAYS** use environment variables from `.env` file
5. **ALWAYS** keep `.env` file in `.gitignore`

### ❌ FORBIDDEN - Never Do This:
```javascript
// NEVER DO THIS
const config = {
  superwall: {
    apiKey: 'pk_actual_key_here' // ABSOLUTELY FORBIDDEN
  }
}
```

### ✅ CORRECT - Always Do This:
```javascript
// ALWAYS DO THIS
const config = {
  superwall: {
    apiKey: process.env.SUPERWALL_API_KEY // Read from environment
  }
}
```

### Environment Variable Management:
- **Development**: Use `.env` file (gitignored)
- **Production**: Use EAS Secrets or secure environment configuration
- **Testing**: Use mock/test keys or environment variables

### If API Keys Don't Load:
1. Check `.env` file exists and has correct values
2. Restart the development server completely
3. Check environment variable loading in the build process
4. Use proper environment variable loaders (dotenv, etc.)

### Security Checklist Before Commits:
- [ ] No hardcoded API keys in any `.ts`, `.tsx`, `.js` files
- [ ] No API keys in `app.json` extra section
- [ ] `.env` file is in `.gitignore`
- [ ] All sensitive data reads from environment variables

## 🚨 INCIDENT PREVENTION
This file exists because API keys were temporarily hardcoded during debugging.
This must NEVER happen again. Always find alternative debugging methods that maintain security.

---
Last Updated: 2025-09-03
Reason: Reminder after temporary hardcoding incident during paywall debugging