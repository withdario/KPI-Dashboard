# Detailed Component Architecture

## Frontend Architecture (React SPA)

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Dashboard
│       │   ├── Header
│       │   ├── MetricsGrid
│       │   │   ├── MetricCard
│       │   │   └── ChartComponent
│       │   ├── Navigation
│       │   └── Sidebar
│       ├── Analytics
│       ├── Automation
│       └── Settings
└── ErrorBoundary
```

### State Management

- **React Context:** Authentication state and user preferences
- **Local State:** Component-specific UI state
- **Server State:** API data with React Query for caching and synchronization
- **Form State:** React Hook Form for form validation and submission

### Key Frontend Libraries

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "react-query": "^3.39.0",
  "react-hook-form": "^7.43.0",
  "chart.js": "^4.2.0",
  "react-chartjs-2": "^5.2.0",
  "tailwindcss": "^3.2.0",
  "lucide-react": "^0.263.0"
}
```

## Backend Architecture (Express.js)

### Service Layer Architecture

```
Express App
├── Middleware Stack
│   ├── CORS
│   ├── Helmet (Security)
│   ├── Rate Limiting
│   ├── Body Parsing
│   ├── Authentication
│   └── Error Handling
├── API Routes
│   ├── /api/auth
│   ├── /api/metrics
│   ├── /api/integrations
│   └── /api/webhooks
├── Service Layer
│   ├── AuthService
│   ├── MetricsService
│   ├── IntegrationService
│   └── WebhookService
├── Data Access Layer
│   ├── Prisma Client
│   ├── Repository Pattern
│   └── Database Migrations
└── External Integrations
    ├── Google Analytics API
    ├── n8n Webhook Handler
    └── CRM API Clients
```

### Service Responsibilities

- **AuthService:** User authentication, JWT management, password hashing
- **MetricsService:** Data aggregation, trend calculation, metric processing
- **IntegrationService:** External API connections, data synchronization
- **WebhookService:** n8n webhook processing, automation data collection

## Database Architecture (PostgreSQL)

### Database Schema Design

```sql
-- Core Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google_analytics', 'n8n', 'crm'
    credentials JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'running'
    execution_time_ms INTEGER,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_metrics_user_date ON metrics(user_id, metric_date);
CREATE INDEX idx_metrics_integration_date ON metrics(integration_id, metric_date);
CREATE INDEX idx_automation_user_date ON automation_executions(user_id, started_at);
CREATE INDEX idx_integrations_user_provider ON integrations(user_id, provider);

-- Row-Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own metrics" ON metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own automations" ON automation_executions
    FOR ALL USING (auth.uid() = user_id);
```

### Data Retention Strategy

- **Detailed Metrics:** 90 days retention for granular analysis
- **Aggregated Metrics:** 1 year retention for trend analysis
- **User Data:** Indefinite retention (GDPR compliant)
- **Audit Logs:** 7 years retention for compliance
