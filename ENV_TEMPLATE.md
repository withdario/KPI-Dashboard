# 🔐 ENVIRONMENT VARIABLES TEMPLATE

**⚠️ CRITICAL SECURITY WARNING: NEVER commit .env files to Git!**

## 📋 How to Set Up Your Environment

1. **Copy this template to `.env`**
2. **Fill in your actual values**
3. **Keep `.env` in your `.gitignore`**

## 🌐 Database Configuration (Supabase)

```bash
# Supabase PostgreSQL with connection pooling
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:6543/postgres?pgbouncer=true"

# Direct Supabase connection (for migrations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:5432/postgres"
```

## 🔑 Authentication & Security

```bash
# JWT Configuration
JWT_SECRET="[GENERATE-A-SECURE-RANDOM-STRING]"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET="[GENERATE-A-SECURE-RANDOM-STRING]"
```

## 🚀 Server Configuration

```bash
# Server Settings
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3001"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Google Analytics 4 Integration

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID="[YOUR-GOOGLE-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[YOUR-GOOGLE-CLIENT-SECRET]"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
GOOGLE_ANALYTICS_PROPERTY_ID="[YOUR-GA4-PROPERTY-ID]"
GOOGLE_APPLICATION_CREDENTIALS="[PATH-TO-SERVICE-ACCOUNT-KEY]"
```

## 🔄 n8n Webhook Integration

```bash
# Webhook Security
ALLOWED_WEBHOOK_IPS=""
WEBHOOK_RATE_LIMIT_WINDOW_MS=900000
WEBHOOK_RATE_LIMIT_MAX_REQUESTS=1000
WEBHOOK_MAX_PAYLOAD_SIZE="1mb"
WEBHOOK_SIGNATURE_SECRET="[GENERATE-A-SECURE-RANDOM-STRING]"
```

## 📧 Email Configuration

```bash
# SMTP Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="[YOUR-EMAIL]@gmail.com"
SMTP_PASS="[YOUR-APP-PASSWORD]"
```

## 🎨 Frontend Configuration

```bash
# React App Settings
REACT_APP_API_URL="http://localhost:3000"
REACT_APP_ENVIRONMENT="development"
```

## 📝 Logging

```bash
# Log Configuration
LOG_LEVEL="info"
LOG_FILE="logs/app.log"
```

## 🚨 SECURITY CHECKLIST

- [ ] `.env` file is in `.gitignore`
- [ ] No real credentials in any committed files
- [ ] JWT_SECRET is a strong random string
- [ ] SESSION_SECRET is a strong random string
- [ ] Google OAuth credentials are secure
- [ ] Database passwords are secure
- [ ] Webhook secrets are secure

## 🔧 Generate Secure Secrets

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📱 Environment-Specific Files

- `.env` - Local development
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Testing environment

**Remember: Only `.env.example` and `.env.sample` should be committed to Git!**
