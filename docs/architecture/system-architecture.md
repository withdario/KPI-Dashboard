# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React SPA)   │◄──►│   (Express.js)  │◄──►│   APIs         │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - API Routes    │    │ - Google       │
│ - Auth UI       │    │ - Services      │    │   Analytics    │
│ - Charts        │    │ - Middleware    │    │ - n8n Webhooks │
│ - Responsive    │    │ - Data Layer    │    │ - CRM APIs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │  (PostgreSQL)   │
                       │                 │
                       │ - Users         │
                       │ - Metrics       │
                       │ - Integrations  │
                       │ - RLS Policies  │
                       └─────────────────┘
```

## Architecture Principles

1. **Separation of Concerns:** Clear boundaries between UI, business logic, and data layers
2. **API-First Design:** All functionality exposed through RESTful API endpoints
3. **Stateless Services:** Backend services maintain no client state between requests
4. **Graceful Degradation:** System continues functioning when external APIs fail
5. **Security by Design:** Authentication, authorization, and data protection built-in
6. **Scalability Ready:** Architecture supports horizontal scaling and multi-tenancy
