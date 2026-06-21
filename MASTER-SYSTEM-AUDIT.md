# VISIONESOFT PLATFORM - MASTER SYSTEM ARCHITECTURE AND IMPLEMENTATION SPECIFICATION

> **Document Version**: v33.0.0
> **Date**: 2026-06-21
> **Branch**: `main`
> **Owner**: Platform Architecture Team
> **Document Type**: Greenfield rebuild source of truth
> **Architecture Status**: Architecture Complete
> **Program State**: Greenfield Rebuild — Active Build
> **Build Progress**: ~35% (Phase 0 complete, Phase 1 partially complete)
> **Next Stage**: Phase 2 — Aggregator Operations (Pricing, Routing, Callbacks, Settlement)

---

## REBUILD DIRECTIVE

This document is no longer an audit of a completed platform. It is the master rebuild specification for a greenfield implementation.

- Rebuild mode: Greenfield
- Architecture status: Architecture Complete
- Architecture baseline: Frozen for Phase 0 implementation
- Legacy completion percentages: deprecated
- Legacy production-ready statements: deprecated
- Module language: planned target architecture only
- Current build progress: ~35%
- Next action: Phase 2 — Aggregator Operations. All Phase 0 and Phase 1 service scaffolding complete.

### Production Readiness

Status: Not applicable  
Program Mode: Greenfield Rebuild  
Build Progress: 0%

### Architecture Freeze

Status: Architecture Complete  
Freeze Date: 2026-06-20  
Frozen Baseline: v32.0.0  
Build Entry Point: Phase 0 - Foundation

The master architecture is complete enough to stop expanding the blueprint and start implementation. Future changes should be treated as controlled architecture change requests or implementation discoveries, not open-ended architecture expansion.

---

## DOCUMENT STRUCTURE

This specification is split into two required layers.

| Volume | Purpose | Audience |
|--------|---------|----------|
| Volume 1 - Master System Architecture | Program charter, product topology, domain boundaries, non-negotiable architecture decisions | Executives, architects, product leads, engineering leads |
| Volume 2 - Detailed Implementation Specification | Module-level PRDs, database blueprint, API blueprint, RBAC matrix, workflows, integrations, Cloudflare, AI, media, white-label architecture | Product managers, backend engineers, frontend engineers, QA, DevOps, data, security |

---

## TABLE OF CONTENTS

1. Program Status Model
2. System Overview and Architecture
3. Target Product Architecture
4. Workspace and UI Architecture
5. Infrastructure Architecture
6. Data Warehouse and Analytics Architecture
7. Infrastructure Directory Structure
8. Storage, Cloudflare, Media, and AI Architecture
9. Security and Compliance Architecture
10. Identity and Access Management Architecture
11. Event-Driven Architecture
12. Integration Gateway Architecture
13. Workflow and BPM Architecture
14. Configuration Architecture
15. API Management Architecture
16. Master Data Management Architecture
17. Enterprise Data Governance Architecture
18. Disaster Recovery Architecture
19. Release Management Architecture
20. Enterprise Document Management Architecture
21. Enterprise Scheduling Architecture
22. Feature Flag Architecture
23. Localization Architecture
24. Licensing and Jurisdiction Architecture
25. Enterprise Case Management Architecture
26. Reconciliation Architecture
27. Business Rules Engine Architecture
28. CMS and Content Architecture
29. Partner Ecosystem Architecture
30. Capacity and Scalability Architecture
31. Security Operations Architecture
32. Business Continuity Architecture
33. Enterprise KPI Architecture
34. Metadata Architecture
35. Enterprise Integration Platform Architecture
36. Aggregator PRD
37. Route Architecture
38. B2B PRD
39. B2C PRD
40. Database Architecture
41. API Architecture
42. RBAC and Permission Matrix
43. Core Workflows
44. Integration Architecture
45. Cloudflare Architecture
46. Media Center Architecture
47. AI Architecture
48. White Label Architecture
49. Finance Architecture
50. Reporting Architecture
51. Notification Architecture
52. Fraud and Risk Architecture
53. Responsible Gaming Architecture
54. Observability Architecture
55. DevOps Architecture
56. Multi-Tenant Architecture
57. Sportsbook Architecture
58. Advanced Bonus Architecture
59. Mobile Architecture
60. Game Aggregation Engine
61. Enterprise Search Architecture
62. Audit Center Architecture
63. Testing and Quality Blueprint
64. Implementation Phases
65. Governance and Change Control
66. Change Log

---

## 1. PROGRAM STATUS MODEL

### 1.1 Status Legend

| Status | Meaning |
|--------|---------|
| Planned | Target requirement is defined but not built |
| In Development | Implementation has started |
| Under Testing | Implementation is being validated |
| Completed | Feature is built and accepted for the rebuild baseline |

### 1.2 Default Status Rule

All modules, entities, APIs, workflows, integrations, and UI surfaces default to **Planned** unless explicitly updated through governance.

### 1.3 Global Build Status

| Architecture State | Value |
|--------------------|-------|
| Master Architecture Status | Architecture Complete |
| Architecture Baseline | v32.0.0 |
| Architecture Freeze Date | 2026-06-20 |
| Program State | Greenfield Rebuild |
| Current Execution Stage | Phase 0 - Foundation |

| Layer | Progress |
|-------|----------|
| Database Schema | 45% — Core aggregator schema complete, B2C/B2B/Compliance/VIP/Settlement models added |
| API Layer | 40% — API gateway with 30+ routes, all service interfaces defined |
| Business Logic | 35% — All 28 services implemented with domain logic, repositories, validation |
| Frontend UI/UX | 30% — Complete React backoffice with auth, routing, 18 pages, dashboard |
| Infrastructure | 20% — K8s base, namespace, postgres, api-gateway, ingress manifests, CI/CD |
| Integrations | 15% — Provider adapter SDK, PSP adapter SDK, compliance adapters, AI adapters |
| Testing | 5% — TypeScript type checking as baseline; unit/integration tests pending |
| Documentation | 60% — Architecture spec complete, MASTER-SYSTEM-AUDIT maintained |
| Overall Build Status | ~35% |

### 1.4 Freeze Rule

The master architecture is frozen for implementation. New architecture topics should be added only when an implementation discovery reveals a material gap, regulatory requirement, security requirement, or approved product strategy change.

---

## 2. SYSTEM OVERVIEW AND ARCHITECTURE

### 2.1 Executive System Overview

VisioneSoft is an enterprise iGaming ecosystem designed as a single platform for aggregators, operators, agents, affiliates, players, white labels, and administrative teams.

The platform combines:

- Aggregator
- B2B
- B2C
- White Label
- Media Center
- AI Platform
- Sportsbook
- Data Warehouse
- Compliance
- Finance

Primary purpose:

- Provide one enterprise control plane for provider supply, operator distribution, player operations, finance, compliance, reporting, media, AI-assisted operations, sportsbook, and white-label delivery.
- Support both platform-level ownership and tenant-scoped operator businesses.
- Keep all commercial, financial, player, media, and operational workflows auditable and permissioned.

### 2.2 High-Level Platform Architecture

```text
+--------------------------------------------------+
|                    Clients                       |
+--------------------------------------------------+
| Web Apps                                         |
| Mobile Apps                                      |
| White Label Sites                                |
| Operator Portals                                 |
| Agent Portals                                    |
| Affiliate Portals                                |
| API Consumers                                    |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|                Experience Layer                  |
+--------------------------------------------------+
| Next.js                                          |
| Nexa UI Shell                                    |
| Design System                                    |
| AI Copilot UI                                    |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|                  API Gateway                     |
+--------------------------------------------------+
| Authentication                                   |
| RBAC                                             |
| Rate Limiting                                    |
| Tenant Isolation                                 |
| Audit                                            |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|                Domain Services                   |
+--------------------------------------------------+
| Aggregator                                       |
| B2B                                              |
| B2C                                              |
| Finance                                          |
| Compliance                                       |
| Media                                            |
| AI                                               |
| Reporting                                        |
| Notifications                                    |
| Sportsbook                                       |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|                   Data Layer                     |
+--------------------------------------------------+
| PostgreSQL                                       |
| Redis                                            |
| ClickHouse                                       |
| RustFS                                           |
| Cloudflare R2                                    |
+--------------------------------------------------+
```

### 2.3 Business Domain Architecture

```text
VisioneSoft Platform
|
+-- Aggregator
|   +-- Providers
|   +-- Vendors
|   +-- Games
|   +-- Operators
|   +-- Agents
|   +-- Routing
|   +-- Pricing
|   +-- Settlements
|
+-- B2B
|   +-- White Labels
|   +-- CRM
|   +-- Billing
|   +-- Compliance
|   +-- Support
|   +-- Affiliates
|
+-- B2C
|   +-- Players
|   +-- Wallets
|   +-- Payments
|   +-- Bonuses
|   +-- VIP
|   +-- Marketing
|
+-- Sportsbook
+-- Media Center
+-- AI Platform
+-- Data Warehouse
+-- Finance
+-- Notification Center
+-- Fraud Center
+-- Audit Center
```

### 2.4 End-to-End Request Flow

Example: player plays a casino game.

```text
Player
  -> White Label Site / Mobile App
    -> B2C Player Session
      -> Wallet Engine
        -> Aggregator Routing Engine
          -> Provider Adapter
            -> Game Provider
              -> Provider Callback
                -> Callback Engine
                  -> Ledger
                    -> Wallet Balance
                      -> Reporting / Warehouse / Audit
```

Rules:

- Every money-moving step must be idempotent.
- Every provider callback must be validated and stored raw before normalization.
- Every ledger movement must be traceable to the player, operator, provider, game, route, and source event.
- Every reporting event must derive from ledger, transaction, provider, payment, or warehouse-controlled facts.

### 2.5 Deployment Architecture

```text
Internet
  -> Cloudflare
    -> Kubernetes Ingress
      -> API Gateway / Next.js BFF
        -> Domain Services
          -> Workers / Queues
            -> PostgreSQL / Redis / ClickHouse
              -> RustFS / Cloudflare R2 / Cloudflare Images
```

Deployment requirements:

- Cloudflare protects public traffic and delivers media/CDN assets.
- Kubernetes runs application services, workers, scheduled jobs, and internal APIs.
- API Gateway enforces authentication, authorization, tenant isolation, rate limits, and audit hooks.
- Databases and object storage remain internal to platform infrastructure.
- Workers handle callbacks, reconciliation, notifications, ETL/ELT, media transforms, AI jobs, and scheduled finance operations.

### 2.6 Data Flow Architecture

Provider and game supply flow:

```text
Providers
  -> Aggregator
    -> Operators
      -> White Labels
        -> Players
```

Payment and wallet flow:

```text
Payments
  -> Wallet
    -> Ledger
      -> Settlement
        -> Finance
          -> Reporting
```

Media delivery flow:

```text
Media Upload / AI Generation
  -> RustFS
    -> Cloudflare R2
      -> Cloudflare Images
        -> CDN
          -> White Labels / Mobile Apps / Portals
```

Analytics flow:

```text
Domain Events
  -> Raw Event Store
    -> ETL / ELT
      -> ClickHouse Warehouse
        -> KPI Cubes
          -> Reports / Dashboards / AI Copilot
```

### 2.7 System Context Diagram

```text
External Actors
|
+-- Providers
+-- Vendors
+-- Operators
+-- Agents
+-- Affiliates
+-- Players
+-- PSPs
+-- KYC Vendors
+-- AML Vendors
+-- Cloudflare
+-- Admins
|
v
+--------------------------------------------------+
|              VisioneSoft Platform                |
|  Aggregator + B2B + B2C + Finance + Media + AI   |
|  Sportsbook + Data Warehouse + Compliance        |
+--------------------------------------------------+
|
v
Outputs
|
+-- Reports
+-- Dashboards
+-- APIs
+-- White Labels
+-- Mobile Apps
+-- Notifications
+-- Audit Evidence
+-- Financial Statements
```

### 2.8 Core Architectural Principles

| Principle | Requirement | Status |
|-----------|-------------|--------|
| API First | All core capabilities must be available through versioned APIs | Planned |
| Multi-Tenant | Tenant, operator, white-label, and role scope must be enforced across all layers | Planned |
| Cloud Native | Services, workers, queues, storage, and observability must be deployable on Kubernetes | Planned |
| Event Driven | Critical business events must feed workflows, warehouse, audit, reporting, and AI | Planned |
| Security First | Auth, RBAC, rate limits, validation, encryption, and WAF controls are baseline requirements | Planned |
| Zero Trust | No internal or external request is trusted without identity, permission, and scope validation | Planned |
| Auditability | Critical changes and financial events must produce immutable audit evidence | Planned |
| Compliance by Design | KYC, AML, RG, GDPR/DSAR, financial controls, and jurisdiction rules are platform primitives | Planned |
| AI Assisted Operations | AI may assist analysis, media, support, and workflows but cannot bypass permissions or approvals | Planned |
| Financial Correctness | Money movement must reconcile through ledger, wallet, payment, settlement, and finance records | Planned |

---

# VOLUME 1 - MASTER SYSTEM ARCHITECTURE

---

## 3. TARGET PRODUCT ARCHITECTURE

### 3.1 Platform Domains

| Domain | Purpose | Status |
|--------|---------|--------|
| Aggregator | Provider, vendor, game, operator, agent, pricing, routing, API, callback, health, settlement control plane | Planned |
| B2B | White-label operations, CRM, billing, compliance, KYC, support, affiliate, reporting, operator lifecycle | Planned |
| B2C | Player lifecycle, wallets, payments, bonuses, VIP, tournaments, marketing, responsible gaming | Planned |
| Media and AI | Asset operations, Cloudflare media stack, AI generation, AI copilot, analytics, approvals | Planned |
| Finance | Ledger, treasury, revenue recognition, FX, financial statements, cash flow, P&L | Planned |
| Data and Reporting | Warehouse, ETL/ELT, KPI cubes, analytics, reports, BI layer | Planned |
| Sportsbook | Sports providers, markets, odds, bet slip, live feed, settlements, trading, risk | Planned |
| Mobile | iOS, Android, white-label app configuration, push, deep links, mobile branding | Planned |
| Platform Core | Identity, RBAC, audit, notification, workflow, configuration, observability, DevOps, multi-tenancy | Planned |

### 3.2 Target Topology

```text
Clients
  -> Next.js Workspace UI
    -> API Gateway / BFF Layer
      -> Domain Services
        -> PostgreSQL + Redis + ClickHouse
          -> RustFS primary object storage
            -> Cloudflare R2 replication/archive
              -> Cloudflare Images / CDN / Workers AI
```

### 3.3 Domain Separation Rules

- Aggregator manages upstream provider/vendor supply and downstream operator distribution.
- B2B manages operator-facing business operations and white-label configuration.
- B2C manages player-facing operations, player data, wallet use, campaigns, and responsible gaming.
- Buy price visibility is restricted to Owner Admin only.
- Sell price visibility is available only to roles explicitly allowed by tenant and operator scope.
- Provider callbacks must be validated, signed, idempotent, and isolated from player-facing APIs.
- Operator APIs must never expose another operator's games, pricing, wallets, invoices, players, or CRM data.
- Agent views must be limited to assigned operators and assigned commercial data.

---

## 4. WORKSPACE AND UI ARCHITECTURE

### 4.1 Foundation Decision

Nexa Admin may be used only as a UI shell foundation, license permitting.

Use from template:

- Layout and shell
- Theme and dark mode primitives
- Form and table primitives
- Chart primitives
- Authentication screens

Do not keep from template:

- Generic dashboards
- Generic CRM pages
- Generic analytics semantics
- Generic navigation model
- Generic KPI meaning

### 4.2 Workspace Model

| Workspace | Navigation Domains | Status |
|-----------|--------------------|--------|
| Aggregator | Dashboard, Providers, Vendors, Games, Operators, Agents, Buy Price, Sell Price, Route Center, Routing, RTP, API Management, Callbacks, Provider Health, Settlement | Planned |
| B2B | Dashboard, White Labels, CRM, Billing, Compliance, KYC, Support, Affiliate, Reports, Operator Success | Planned |
| B2C | Dashboard, Players, Wallets, Bonuses, VIP, Payments, Marketing, Tournaments, Responsible Gaming, Support | Planned |
| Media and AI | Media Library, Provider Logos, Game Images, Banner Library, AI Generator, Cloudflare Images, Cloudflare R2, Workers AI, CDN Analytics | Planned |
| Platform Admin | Identity, RBAC, Audit Logs, Tenants, System Config, Integrations, Feature Flags, Observability | Planned |

### 4.3 UX Interaction Standards

- Command palette: `Ctrl + K`
- Universal search entities: provider, vendor, operator, agent, player, game, invoice, settlement, transaction, media asset
- Right panel: filters, layout controls, notes, favorites, page settings
- Real-time operations center: single-screen live operations for bets, payments, provider health, alerts, and incidents
- Bulk actions: supported for pricing, provider activation, game status, media approvals, KYC review queues, campaign actions
- Audit drawer: available on critical records

### 4.4 KPI Dashboard Blueprint

Row 1:

- Total GGR
- Total NGR
- Operators
- Agents
- Providers
- Vendors
- Active Players
- Deposits
- Withdrawals
- Revenue
- System Health

Row 2:

- Revenue trend
- Deposits trend
- Players trend
- Provider performance
- Operator performance
- Route performance

Row 3:

- Recent alerts
- Provider health
- Top operators
- Top agents
- Top games
- Open settlements

---

## 5. INFRASTRUCTURE ARCHITECTURE

| Service | Role | Status |
|---------|------|--------|
| Next.js App | Workspace UI and API facade | Planned |
| API Gateway | Authentication, tenant scope, rate limits, routing | Planned |
| Domain Services | Aggregator, B2B, B2C, Finance, Compliance, Media, AI | Planned |
| PostgreSQL | Primary transactional datastore | Planned |
| Redis | Cache, queues, pub/sub, session coordination | Planned |
| ClickHouse | Analytics, events, BI, dashboards | Planned |
| Worker Runtime | Scheduled jobs, async processing, callback replay, reconciliation | Planned |
| Object Storage | RustFS primary, Cloudflare R2 replication/archive | Planned |
| Observability Stack | Logs, metrics, traces, alerting | Planned |

### 5.1 Kubernetes Requirements

- Environment isolation: development, staging, production
- HPA for APIs and workers
- Central secrets management
- Progressive delivery and rollback
- Namespace separation by environment
- Resource quotas and limit ranges
- Zero-downtime migration strategy
- Separate worker pools for finance, callbacks, media, AI, and analytics jobs

---

## 6. DATA WAREHOUSE AND ANALYTICS ARCHITECTURE

### 6.1 Purpose

The Data Warehouse serves as the central analytical platform for Aggregator, B2B, B2C, Finance, Compliance, AI, Fraud, Route Optimization, and Executive Reporting.

Status: Planned

The warehouse is the platform intelligence layer. It turns operational activity into governed analytics, BI datasets, KPI cubes, compliance reports, fraud analysis, AI insights, forecasting, executive dashboards, and board reporting.

### 6.2 High-Level Analytics Architecture

```text
Operational Systems
|
+-- Aggregator
+-- B2B
+-- B2C
+-- Wallet
+-- Payments
+-- CRM
+-- Compliance
+-- Media
+-- AI
|
+-------------------+
                    |
                    v
          Event Collection Layer
                    |
                    v
          Data Processing Layer
                    |
                    v
              ClickHouse
          Analytics Warehouse
                    |
      +-------------+-------------+
      |             |             |
      v             v             v
      BI        Reporting         AI
```

### 6.3 Analytics Data Domains

| Domain | Analytics Areas | Status |
|--------|-----------------|--------|
| Aggregator Analytics | Provider performance, vendor performance, operator performance, agent performance, route analytics, RTP analytics, settlement analytics, revenue analytics | Planned |
| B2B Analytics | CRM analytics, sales funnel analytics, white-label analytics, affiliate analytics, invoice analytics, billing analytics, compliance analytics | Planned |
| B2C Analytics | Player analytics, GGR analytics, NGR analytics, deposits, withdrawals, retention, churn, cohort analytics, bonus cost analytics, VIP analytics | Planned |
| Finance Analytics | Revenue recognition, treasury, FX, P&L, cash flow, statements, settlement exposure | Planned |
| Fraud Analytics | Multi-account, device, payment, bonus, affiliate, geo, velocity, and behavioral analytics | Planned |
| Route Analytics | Route latency, success rate, errors, fallback usage, route revenue, route margin, route RTP | Planned |
| Media Analytics | Asset usage, CDN delivery, bandwidth, campaign usage, optimization performance | Planned |
| AI Analytics | Model usage, insight accuracy, anomaly detection, recommendations, cost analytics | Planned |

### 6.4 Data Warehouse Layers

| Layer | Tables / Outputs | Requirement | Status |
|-------|------------------|-------------|--------|
| Layer 1 - Raw Data | `raw_events`, `raw_callbacks`, `raw_payments`, `raw_provider_events`, `raw_wallet_events`, `raw_crm_events`, `raw_media_events` | Immutable source-aligned data | Planned |
| Layer 2 - Normalized Data | `fact_bets`, `fact_wallet_transactions`, `fact_payments`, `fact_settlements`, `fact_affiliates`, `fact_campaigns` | Clean fact data with standard keys and time dimensions | Planned |
| Layer 3 - Business Data | `provider_kpis`, `operator_kpis`, `agent_kpis`, `player_kpis`, `financial_kpis`, `compliance_kpis` | Governed business metrics and KPI cubes | Planned |
| Layer 4 - Executive Data | `executive_dashboard`, `board_reports`, `financial_summaries`, `investor_reports` | Executive-ready snapshots and summaries | Planned |

Layer rules:

- Raw data is immutable.
- Normalized data must preserve lineage back to raw source records.
- Business data must use governed metric definitions.
- Executive data must be reproducible from business and finance layers.

### 6.5 Warehouse Database Structure

#### Fact Tables

| Fact Table | Purpose | Status |
|------------|---------|--------|
| FactBet | Bet-level analytics | Planned |
| FactGameRound | Game round and provider round analytics | Planned |
| FactWalletTransaction | Wallet and ledger movement analytics | Planned |
| FactPayment | Deposit and withdrawal analytics | Planned |
| FactBonus | Bonus cost, wagering, issuance, expiry analytics | Planned |
| FactAffiliateCommission | Affiliate commission and traffic economics | Planned |
| FactSettlement | Provider, vendor, operator, agent, affiliate settlement analytics | Planned |
| FactInvoice | Invoice, credit note, collection, aging analytics | Planned |
| FactCampaign | Campaign delivery, attribution, conversion analytics | Planned |
| FactMediaUsage | Asset usage, delivery, bandwidth, campaign placement analytics | Planned |

#### Dimension Tables

| Dimension Table | Purpose | Status |
|-----------------|---------|--------|
| DimPlayer | Player dimension | Planned |
| DimOperator | Operator dimension | Planned |
| DimAgent | Agent dimension | Planned |
| DimProvider | Provider dimension | Planned |
| DimVendor | Vendor dimension | Planned |
| DimGame | Game dimension | Planned |
| DimCurrency | Currency dimension | Planned |
| DimCountry | Country/jurisdiction dimension | Planned |
| DimTime | Time/calendar dimension | Planned |
| DimWhiteLabel | White-label dimension | Planned |

### 6.6 KPI Engine

#### Aggregator KPIs

| KPI | Purpose | Status |
|-----|---------|--------|
| Provider Revenue | Revenue by provider | Planned |
| Provider Margin | Revenue minus provider cost and fees | Planned |
| Vendor Margin | Vendor revenue, cost, and margin | Planned |
| Route Success Rate | Successful route decisions and completions | Planned |
| Operator Revenue | Revenue by operator | Planned |
| Agent Revenue | Revenue and commissions by agent | Planned |
| RTP Drift | Expected vs actual RTP by route/game/provider/operator | Planned |
| Settlement Exposure | Open settlement exposure by counterparty | Planned |

#### B2B KPIs

| KPI | Purpose | Status |
|-----|---------|--------|
| Active White Labels | Active branded operations | Planned |
| Invoice Collection Rate | Paid vs issued invoice performance | Planned |
| CRM Pipeline | Sales and operator lifecycle pipeline | Planned |
| Affiliate Revenue | Affiliate traffic, revenue, and commission performance | Planned |
| Compliance Queue Health | Pending, overdue, and escalated compliance items | Planned |

#### B2C KPIs

| KPI | Purpose | Status |
|-----|---------|--------|
| GGR | Gross gaming revenue | Planned |
| NGR | Net gaming revenue | Planned |
| ARPU | Average revenue per user | Planned |
| ARPPU | Average revenue per paying user | Planned |
| Retention | Player retention by cohort | Planned |
| Churn | Player churn and churn risk | Planned |
| Bonus Cost | Bonus cost and efficiency | Planned |
| LTV | Player lifetime value | Planned |

### 6.7 Analytics Services

Required services:

```text
services/
|
+-- analytics-service/
+-- warehouse-service/
+-- reporting-service/
+-- kpi-service/
+-- dashboard-service/
+-- data-pipeline-service/
```

| Service | Responsibility | Status |
|---------|----------------|--------|
| analytics-service | Query analytics datasets and expose analytical APIs | Planned |
| warehouse-service | Own warehouse schema, ingestion coordination, and warehouse jobs | Planned |
| reporting-service | Generate governed reports and exports | Planned |
| kpi-service | Define, calculate, cache, and expose KPI cubes | Planned |
| dashboard-service | Serve dashboard-ready aggregates and layout-specific datasets | Planned |
| data-pipeline-service | Own ETL/ELT, CDC ingestion, validation, and replay | Planned |

### 6.8 ETL / ELT Architecture

```text
PostgreSQL
  -> CDC / Event Stream
    -> Transformation Layer
      -> ClickHouse Warehouse
        -> KPIs / Reports / AI
```

Pipeline requirements:

- Use CDC and/or domain events for operational-to-warehouse ingestion.
- Preserve idempotency for replayable events.
- Track pipeline run status, lag, errors, replay windows, and source offsets.
- Validate data quality before publishing governed KPI tables.
- Support backfill by domain, time range, tenant, operator, provider, player cohort, and event type.

### 6.9 Reporting Architecture Powered by Warehouse

| Report Domain | Reports | Status |
|---------------|---------|--------|
| Aggregator Reports | Provider P&L, Vendor P&L, Operator P&L, Agent P&L, RTP Reports, Route Reports, Settlement Reports | Planned |
| B2B Reports | CRM Reports, White Label Reports, Invoice Reports, Affiliate Reports, Compliance Reports | Planned |
| B2C Reports | Player Reports, Deposit Reports, Withdrawal Reports, Bonus Reports, VIP Reports, Retention Reports | Planned |
| Finance Reports | P&L, cash flow, balance sheet, revenue recognition, settlement reconciliation | Planned |
| Executive Reports | Executive dashboard, board reports, financial summaries, investor reports | Planned |

### 6.10 AI Analytics Layer

```text
Warehouse
  -> AI Insights
    +-- Revenue Forecasting
    +-- Churn Prediction
    +-- Fraud Detection
    +-- Route Optimization
    +-- VIP Prediction
    +-- KPI Anomalies
```

AI analytics rules:

- AI must consume permission-filtered warehouse views.
- AI outputs must retain source dataset, query, metric definition, model, prompt, and timestamp.
- AI insights must distinguish observed facts from predictions.
- High-impact recommendations, such as route optimization or fraud actions, must require approval before mutation.

### 6.11 Data Governance

| Governance Area | Requirement | Status |
|-----------------|-------------|--------|
| Data Catalog | Catalog datasets, owners, definitions, refresh cadence, access class | Planned |
| Data Lineage | Track source, transform, warehouse table, KPI, report, and AI usage | Planned |
| Data Retention | Retention rules by domain, jurisdiction, tenant, and data class | Planned |
| Data Classification | PII, financial, compliance, operational, public, internal classes | Planned |
| Data Quality Rules | Null, range, reconciliation, freshness, uniqueness, schema checks | Planned |
| Data Ownership | Assign business and technical owners for each dataset | Planned |
| Audit Tracking | Audit access, exports, dataset changes, and metric changes | Planned |

### 6.12 Analytics APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/analytics` | Analytics root and discovery | Planned |
| `/api/analytics/providers` | Provider analytics | Planned |
| `/api/analytics/operators` | Operator analytics | Planned |
| `/api/analytics/agents` | Agent analytics | Planned |
| `/api/analytics/players` | Player analytics | Planned |
| `/api/analytics/routes` | Route analytics | Planned |
| `/api/analytics/payments` | Payment analytics | Planned |
| `/api/analytics/compliance` | Compliance analytics | Planned |
| `/api/warehouse` | Warehouse dataset and metadata APIs | Planned |
| `/api/reports` | Governed report APIs | Planned |
| `/api/kpis` | KPI cube APIs | Planned |
| `/api/dashboards` | Dashboard data APIs | Planned |

### 6.13 Analytics Rules

- Warehouse data must not bypass RBAC or tenant scope.
- Every KPI must have a metric definition, owner, source data mapping, and test rule.
- Finance-facing analytics must reconcile with ledger and settlement data.
- Compliance reports must preserve evidence and export audit trails.
- Dashboards must use curated KPI datasets, not ad hoc production queries.
- Analytics, reporting, AI, and fraud detection must use consistent warehouse definitions.

---

## 7. INFRASTRUCTURE DIRECTORY STRUCTURE

### 7.1 Repository Architecture

The repository must be organized as a predictable enterprise monorepo. All applications, services, packages, infrastructure, database assets, documentation, scripts, tests, and tools must live in standard locations so teams do not invent competing module structures.

```text
visionesoft-platform/
|
+-- apps/
+-- services/
+-- packages/
+-- infrastructure/
+-- deployments/
+-- database/
+-- docs/
+-- scripts/
+-- tests/
+-- tools/
+-- .github/
```

### 7.2 Apps Directory

User-facing and internal applications live under `apps/`.

```text
apps/
|
+-- backoffice/
+-- operator-portal/
+-- agent-portal/
+-- affiliate-portal/
+-- player-web/
+-- mobile-app/
+-- white-label-builder/
+-- media-center/
+-- ai-copilot/
```

Rules:

- `apps/backoffice` owns the enterprise admin workspace.
- `apps/player-web` owns player-facing web experiences.
- `apps/mobile-app` owns iOS/Android or cross-platform mobile app code.
- `apps/white-label-builder` owns white-label preview and build surfaces.
- `apps/media-center` owns dedicated media workflows where separated from backoffice.
- `apps/ai-copilot` owns standalone AI copilot surfaces where separated from embedded UI.

### 7.3 Services Directory

Backend services live under `services/`.

```text
services/
|
+-- api-gateway/
+-- aggregator-service/
+-- provider-service/
+-- vendor-service/
+-- routing-service/
+-- settlement-service/
+-- operator-service/
+-- crm-service/
+-- billing-service/
+-- compliance-service/
+-- player-service/
+-- wallet-service/
+-- payment-service/
+-- bonus-service/
+-- vip-service/
+-- affiliate-service/
+-- notification-service/
+-- media-service/
+-- ai-service/
+-- reporting-service/
+-- analytics-service/
+-- warehouse-service/
+-- kpi-service/
+-- dashboard-service/
+-- data-pipeline-service/
+-- identity-service/
```

Rules:

- `services/api-gateway` owns auth enforcement, tenant resolution, RBAC, rate limits, request tracing, and API routing.
- `services/routing-service` owns route policies, route decisions, simulations, fallbacks, route health, and route analytics.
- `services/wallet-service` owns wallet and ledger execution, but route selection must use the Route Architecture contract.
- `services/payment-service` owns PSP routing and callbacks, but route policy integration must remain consistent with platform routing.
- `services/settlement-service` owns provider, vendor, operator, agent, affiliate, and sportsbook settlement workflows.
- `services/warehouse-service` owns warehouse schema, ingestion coordination, and warehouse jobs.
- `services/kpi-service` owns governed KPI definitions, calculations, and cube APIs.
- `services/dashboard-service` owns dashboard-ready datasets and dashboard API composition.
- `services/data-pipeline-service` owns CDC/event ingestion, ETL/ELT, validation, replay, and backfill operations.
- Services must not duplicate shared domain contracts that belong in `packages/`.

### 7.4 Packages Directory

Shared libraries live under `packages/`.

```text
packages/
|
+-- ui/
+-- design-system/
+-- auth/
+-- permissions/
+-- audit/
+-- notifications/
+-- workflows/
+-- sdk/
+-- provider-adapters/
+-- payment-adapters/
+-- compliance-adapters/
+-- ai-adapters/
+-- shared-types/
```

Rules:

- `packages/shared-types` owns cross-service contracts, DTOs, enums, and event schemas.
- `packages/permissions` owns RBAC permission constants and authorization helpers.
- `packages/audit` owns audit event contracts and diff helpers.
- `packages/workflows` owns reusable workflow state machines and approval contracts.
- `packages/sdk` owns internal and external API client SDKs.
- Adapter packages must expose stable interfaces and test harnesses.

### 7.5 Database Directory

Database assets live under `database/`.

```text
database/
|
+-- prisma/
+-- migrations/
+-- seeds/
+-- schemas/
+-- views/
+-- clickhouse/
```

Rules:

- `database/prisma` owns Prisma schema files and generated client configuration where Prisma is used.
- `database/migrations` owns transactional database migrations.
- `database/seeds` owns deterministic seed data by environment.
- `database/schemas` owns SQL schema definitions and domain schema splits.
- `database/views` owns reporting, read-model, and permission-filtered views.
- `database/clickhouse` owns warehouse tables, materialized views, dictionaries, and rollups.

### 7.6 Infrastructure Directory

Infrastructure source lives under `infrastructure/`.

```text
infrastructure/
|
+-- kubernetes/
+-- terraform/
+-- monitoring/
+-- logging/
+-- security/
+-- networking/
+-- storage/
+-- cloudflare/
```

Rules:

- `infrastructure/terraform` owns cloud and managed resource definitions where Terraform is selected.
- `infrastructure/monitoring` owns Prometheus, Grafana, Alertmanager, dashboards, and alert rules.
- `infrastructure/logging` owns Loki, log routing, retention, and parsing rules.
- `infrastructure/security` owns WAF policy, secret policy, network policy, and hardening configuration.
- `infrastructure/networking` owns ingress, DNS, service mesh, routing, and network topology definitions.
- `infrastructure/storage` owns RustFS, backup, lifecycle, retention, and replication configuration.

### 7.7 Kubernetes Directory

Kubernetes manifests live under `infrastructure/kubernetes/`.

```text
infrastructure/kubernetes/
|
+-- base/
+-- development/
+-- staging/
+-- production/
+-- ingress/
+-- cert-manager/
+-- redis/
+-- postgres/
+-- clickhouse/
+-- rustfs/
+-- services/
+-- monitoring/
```

Rules:

- `base` owns reusable manifests.
- Environment folders own overlays and environment-specific values.
- `services` owns service deployments, HPAs, PDBs, service accounts, and config maps.
- Infrastructure dependencies must be separated by component folder.
- Production manifests must not depend on development-only secrets or values.

### 7.8 Cloudflare Directory

Cloudflare infrastructure lives under `infrastructure/cloudflare/`.

```text
infrastructure/cloudflare/
|
+-- r2/
+-- images/
+-- workers-ai/
+-- cdn/
+-- waf/
+-- dns/
+-- analytics/
```

Rules:

- `r2` owns buckets, lifecycle, replication, archive, and restore policy.
- `images` owns variants, delivery policy, signed delivery rules, and fallback configuration.
- `workers-ai` owns AI worker configuration, model routing, and runtime policy.
- `cdn` owns cache behavior, purge strategy, and asset routing.
- `waf` owns firewall and bot protection policy.
- `dns` owns zones, records, and white-label domain automation.
- `analytics` owns Cloudflare log and analytics ingestion configuration.

### 7.9 Provider Adapters Directory

Provider adapters live under `packages/provider-adapters/`.

```text
packages/provider-adapters/
|
+-- pragmatic/
+-- evolution/
+-- pgsoft/
+-- hacksaw/
+-- amusnet/
+-- jili/
+-- cq9/
+-- common/
```

Rules:

- `common` owns the provider adapter SDK, shared contracts, mocks, and certification tests.
- Each provider folder owns provider-specific launch, wallet, callback, game sync, RTP, and health implementations.
- Provider-specific code must not leak into service business logic.
- Every provider adapter must pass contract tests before production activation.

### 7.10 Payment Adapters Directory

Payment adapters live under `packages/payment-adapters/`.

```text
packages/payment-adapters/
|
+-- nowpayments/
+-- passimpay/
+-- stripe/
+-- cryptomus/
+-- common/
```

Rules:

- `common` owns PSP adapter contracts, callback validation helpers, mocks, and contract tests.
- PSP-specific folders own payment creation, callback parsing, status mapping, refund/withdrawal support, and health checks.
- PSP-specific code must not be embedded directly inside payment service workflows.

### 7.11 Media Service Directory

Media service internals live under `services/media-service/`.

```text
services/media-service/
|
+-- assets/
+-- transformations/
+-- approvals/
+-- cloudflare-images/
+-- r2/
+-- optimization/
+-- background-removal/
+-- analytics/
```

Rules:

- `assets` owns asset metadata, storage references, versions, and usage mapping.
- `transformations` owns resize, crop, format, and derived asset pipelines.
- `approvals` owns review workflow, comments, approvals, and rejection reasons.
- `cloudflare-images` owns Cloudflare Images integration.
- `r2` owns R2 replication, archive, restore, and lifecycle integration.
- `analytics` owns asset delivery, bandwidth, usage, and optimization metrics.

### 7.12 AI Service Directory

AI service internals live under `services/ai-service/`.

```text
services/ai-service/
|
+-- copilot/
+-- media-generation/
+-- anomaly-detection/
+-- fraud-analysis/
+-- reporting/
+-- workers-ai/
```

Rules:

- `copilot` owns natural-language operations assistant flows.
- `media-generation` owns creative generation and asset variation workflows.
- `anomaly-detection` owns KPI, route, provider, payment, and settlement anomaly detection.
- `fraud-analysis` owns AI-assisted fraud investigation and risk insight workflows.
- `reporting` owns AI-generated report summaries and query assistance.
- `workers-ai` owns Cloudflare Workers AI integration.

### 7.13 Tests Directory

Tests live under `tests/`.

```text
tests/
|
+-- unit/
+-- integration/
+-- e2e/
+-- performance/
+-- security/
+-- provider-contracts/
+-- payment-contracts/
+-- regression/
```

Rules:

- Provider and payment adapters must have dedicated contract test suites.
- Route, wallet, ledger, payment, settlement, fraud, RG, and RBAC tests must be treated as critical-path tests.
- Performance tests must cover callback bursts, route decisions, wallet posting, reporting, warehouse ingestion, and search.
- Security tests must cover authorization bypass, tenant isolation, callback signature validation, and sensitive action controls.

### 7.14 Documentation Directory

Documentation lives under `docs/`.

```text
docs/
|
+-- architecture/
+-- prd/
+-- api/
+-- database/
+-- infrastructure/
+-- runbooks/
+-- onboarding/
+-- compliance/
```

Rules:

- `docs/architecture` owns system, domain, infrastructure, route, data, and security architecture.
- `docs/prd` owns product requirement documents by domain.
- `docs/api` owns OpenAPI, webhook, SDK, and integration references.
- `docs/database` owns schema maps, entity ownership, retention, and migration notes.
- `docs/infrastructure` owns deployment, Kubernetes, Cloudflare, networking, observability, and storage docs.
- `docs/runbooks` owns operational runbooks, incident response, DR, backup restore, and escalation guides.
- `docs/onboarding` owns developer and operator onboarding guides.
- `docs/compliance` owns regulatory, RG, AML, KYC, DSAR, and audit evidence documentation.

### 7.15 Deployment, Scripts, Tools, and GitHub Directories

```text
deployments/
scripts/
tools/
.github/
```

Rules:

- `deployments` owns deployment manifests, release overlays, environment release notes, and deployment plans not owned by infrastructure source.
- `scripts` owns repeatable local and CI scripts for setup, migration, seeding, exports, validation, and maintenance.
- `tools` owns internal developer tools, generators, validators, and one-off operational utilities that are safe to keep versioned.
- `.github` owns GitHub Actions workflows, issue templates, pull request templates, CODEOWNERS, and repository policy automation.

### 7.16 Directory Ownership Rules

- Every top-level folder must have an owner and review policy.
- New services must be added under `services/` and must define API, database, events, tests, observability, and runbook ownership.
- New shared logic must go into `packages/` only when used by more than one app or service.
- Provider integrations must live in `packages/provider-adapters/`.
- Payment integrations must live in `packages/payment-adapters/`.
- Infrastructure changes must live under `infrastructure/` or `deployments/`, not inside application folders.
- Documentation for every new domain must be added under `docs/` in the matching category.

---

## 8. STORAGE, CLOUDFLARE, MEDIA, AND AI ARCHITECTURE

| Layer | Target | Status |
|-------|--------|--------|
| Primary object storage | RustFS | Planned |
| Replication/archive | Cloudflare R2 | Planned |
| Image transformations | Cloudflare Images plus internal fallback transforms | Planned |
| Delivery | Cloudflare CDN | Planned |
| Creative AI | Workers AI plus internal services | Planned |
| Asset analytics | CDN logs, media delivery events, usage rollups | Planned |

### 8.1 Storage Rules

- Original assets must be stored immutably.
- Derived assets must link to source asset and transformation recipe.
- Public delivery URLs must not reveal internal storage paths.
- Private assets must require signed URLs or authenticated delivery.
- R2 replication must include lifecycle and retention policy mapping.

---

## 9. SECURITY AND COMPLIANCE ARCHITECTURE

| Control Area | Requirement | Status |
|--------------|-------------|--------|
| IAM | RBAC, MFA, secure sessions, scoped tokens | Planned |
| Data Protection | Encryption in transit and at rest | Planned |
| Auditability | Immutable audit logging for critical actions | Planned |
| Secrets | Centralized secret rotation | Planned |
| App Security | Validation, rate limiting, WAF, secure headers | Planned |
| Compliance | KYC, AML, responsible gaming, GDPR/DSAR, financial controls | Planned |
| Financial Security | Double-entry ledger, idempotency, reconciliation, segregation of duties | Planned |

---

## 10. IDENTITY AND ACCESS MANAGEMENT ARCHITECTURE

### 10.1 IAM Scope

Identity and Access Management governs authentication, authorization, session security, API access, service identity, SSO, MFA, and privileged access across the full platform.

Status: Planned

### 10.2 IAM Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Authentication | Username/password, passwordless where approved, session lifecycle, login risk checks | Planned |
| Authorization | RBAC, permissions, scope checks, policy evaluation, deny overrides | Planned |
| SSO | Enterprise SSO for operators and internal teams | Planned |
| OAuth | OAuth/OIDC provider and client support | Planned |
| SAML | SAML integration for enterprise operators | Planned |
| MFA | TOTP, WebAuthn/passkeys, recovery codes, enforced MFA policies | Planned |
| Session Management | Secure sessions, refresh rotation, device/session inventory, forced logout | Planned |
| API Authentication | API keys, OAuth clients, signed requests, IP allowlists, scopes | Planned |
| Service Accounts | Machine identities, service tokens, scoped credentials, rotation | Planned |
| Privileged Access | Break-glass access, reason capture, expiry, audit review | Planned |

### 10.3 IAM Rules

- Authentication establishes identity only; authorization must evaluate permission and scope separately.
- Service-to-service calls must use service identity and scoped credentials.
- MFA policy must be configurable by tenant, role, risk, and environment.
- API keys must be scoped, revocable, rotated, rate-limited, and audit logged.
- Break-glass sessions must expire automatically and generate review evidence.

---

## 11. EVENT-DRIVEN ARCHITECTURE

### 11.1 Event-Driven Scope

The Event-Driven Architecture connects services, integrations, workflows, warehouse, notifications, audit, fraud, AI, and reporting through governed domain events and integration events.

Status: Planned

### 11.2 Event Platform Components

| Component | Requirement | Status |
|-----------|-------------|--------|
| Event Bus | Publish/subscribe transport for domain and integration events | Planned |
| Domain Events | Business facts emitted by domain services | Planned |
| Integration Events | External-facing or adapter-facing event contracts | Planned |
| Event Store | Durable event record for replay, audit, and downstream recovery | Planned |
| Dead Letter Queues | Failed event isolation with reason, retry metadata, and owner | Planned |
| Replay Mechanism | Replay by event type, time range, tenant, operator, entity, and offset | Planned |
| Outbox Pattern | Transactional event publication for critical writes | Planned |
| Event Schema Registry | Versioned event contracts and compatibility checks | Planned |

### 11.3 Core Event Examples

| Event | Producer | Consumers | Status |
|-------|----------|-----------|--------|
| PlayerRegistered | Player service | CRM, marketing, fraud, warehouse, audit | Planned |
| DepositCompleted | Payment service | Wallet, bonus, fraud, warehouse, notifications | Planned |
| BonusGranted | Bonus service | Wallet, reporting, fraud, notifications, warehouse | Planned |
| ProviderDisconnected | Provider service | Routing, observability, notifications, incident management | Planned |
| InvoiceIssued | Billing service | Finance, reporting, notifications, warehouse | Planned |
| RouteDegraded | Routing service | Route fallback, incident management, reporting, AI | Planned |
| WithdrawalApproved | Payment service | Wallet, PSP adapter, notifications, audit, warehouse | Planned |
| WhiteLabelPublished | White-label service | CDN, search, audit, notifications, warehouse | Planned |

### 11.4 Event Rules

- Event names must represent facts that already happened.
- Event schemas must be versioned and backward-compatible where possible.
- Financial events must use outbox publication and idempotent consumers.
- Event consumers must be replay-safe.
- Dead-lettered events must have owner, severity, retry policy, and escalation path.
- Events containing PII or financial data must use classification and access controls.

---

## 12. INTEGRATION GATEWAY ARCHITECTURE

### 12.1 Integration Gateway Scope

The Integration Gateway isolates external provider, PSP, KYC, messaging, AI, sportsbook, and data integrations behind stable platform contracts so integration-specific logic does not leak into core services.

Status: Planned

### 12.2 Gateway Types

| Gateway | Purpose | Status |
|---------|---------|--------|
| Provider Gateway | Game provider launch, wallet, callback, game sync, RTP, health | Planned |
| PSP Gateway | Payment creation, callbacks, payout, status, reconciliation, health | Planned |
| KYC Gateway | Identity checks, document verification, sanctions, PEP, vendor results | Planned |
| Messaging Gateway | Email, SMS, WhatsApp, Telegram, push, delivery status | Planned |
| AI Gateway | Model routing, prompt policy, tool access, safety, usage tracking | Planned |
| Sportsbook Gateway | Odds feeds, event feeds, settlement feeds, trading integrations | Planned |
| Data Gateway | External exports/imports, BI connectors, accounting feeds | Planned |

### 12.3 Gateway Rules

- All external payloads must be stored raw before normalization.
- Gateway adapters must own provider-specific schemas, signatures, status mapping, retry behavior, and health checks.
- Core services must depend on gateway contracts, not vendor SDK internals.
- Gateways must expose health, metrics, traces, and dead-letter queues.
- Credential storage and rotation must be centralized and environment-scoped.

---

## 13. WORKFLOW AND BPM ARCHITECTURE

### 13.1 Workflow Scope

The Workflow and BPM Architecture controls human and automated business processes with definitions, runtime instances, approval chains, escalations, SLA timers, and audit evidence.

Status: Planned

### 13.2 Workflow Engine Components

| Component | Requirement | Status |
|-----------|-------------|--------|
| Workflow Definitions | Versioned process definitions and state machines | Planned |
| Workflow Engine | Runtime execution, transitions, guards, timers, and actions | Planned |
| Approval Chains | Sequential, parallel, threshold-based, and role-based approvals | Planned |
| Escalations | SLA breach, timeout, rejection, exception, and manual escalation | Planned |
| SLA Timers | Timer scheduling, pause/resume rules, breach events | Planned |
| Task Queues | Human task assignment, claiming, reassignment, comments | Planned |
| Workflow Audit | State transitions, actors, reasons, evidence, and diffs | Planned |

### 13.3 Required Workflows

| Workflow | Requirement | Status |
|----------|-------------|--------|
| Withdrawal Approval | Risk, KYC, AML, threshold, finance approval, PSP execution | Planned |
| KYC Review | Document review, provider checks, manual decision, escalation | Planned |
| Provider Onboarding | Contract, credentials, game sync, health test, approval, activation | Planned |
| Invoice Approval | Draft, review, adjustment, approval, issue, dispute, void | Planned |
| White Label Publish | Draft, preview, compliance review, approval, publish, rollback | Planned |
| Route Policy Activation | Draft, simulation, margin/RTP/health checks, approval, production | Planned |
| Media Approval | Upload/generate, optimize, review, approve, publish, rollback | Planned |

### 13.4 Workflow Rules

- Workflow definitions must be versioned.
- Workflow state changes must be auditable.
- Manual approvals must capture actor, reason, scope, and evidence.
- SLA breaches must emit events and notifications.
- Workflow actions that mutate financial or compliance state must be idempotent.

---

## 14. CONFIGURATION ARCHITECTURE

### 14.1 Configuration Scope

Configuration Architecture centralizes platform settings so global, tenant, operator, white-label, provider, feature, risk, finance, payment, and routing settings do not scatter across unrelated tables or service-specific files.

Status: Planned

### 14.2 Configuration Layers

| Layer | Purpose | Status |
|-------|---------|--------|
| Global Config | Platform-wide defaults and hard safety limits | Planned |
| Tenant Config | Tenant-specific overrides and enabled capabilities | Planned |
| Operator Config | Operator settings, limits, providers, payments, compliance | Planned |
| White Label Config | Branding, domains, menus, localization, SEO, app config | Planned |
| Provider Config | Credentials, capabilities, wallet mode, callback rules, limits | Planned |
| Feature Config | Feature flags, rollout rules, experiments, kill switches | Planned |
| Risk Config | Fraud, AML, payment risk, RG thresholds | Planned |
| Finance Config | Ledger, FX, settlement, revenue recognition settings | Planned |

### 14.3 Configuration Rules

- Configuration must be versioned where it affects behavior.
- Runtime configuration must support validation, preview, approval, and rollback.
- Configuration precedence must be explicit: global, tenant, operator, white label, provider, player where applicable.
- Sensitive configuration values must be stored in secrets management, not plain config records.
- Configuration changes must emit audit and configuration-change events.

---

## 15. API MANAGEMENT ARCHITECTURE

### 15.1 API Management Scope

API Management governs public, partner, operator, agent, affiliate, provider, internal, and service APIs through cataloging, versioning, lifecycle, access control, documentation, developer experience, and analytics.

Status: Planned

### 15.2 API Management Modules

| Module | Requirement | Status |
|--------|-------------|--------|
| Developer Portal | API docs, onboarding, keys, scopes, webhooks, examples | Planned |
| API Catalog | Domain APIs, ownership, version, status, contracts | Planned |
| API Versioning | Version policy, deprecation, compatibility, migration guides | Planned |
| API Lifecycle | Draft, review, published, deprecated, retired | Planned |
| API Usage Analytics | Requests, latency, errors, rate-limit hits, consumer usage | Planned |
| API Policy | Authentication, scopes, rate limits, quotas, IP allowlists | Planned |
| Webhook Management | Subscriptions, signatures, retries, event types, delivery logs | Planned |

### 15.3 API Management Rules

- APIs must have owners, contracts, auth model, rate limit, and lifecycle status.
- Public and partner APIs must have documentation and examples before publication.
- Deprecated APIs must define sunset date and migration path.
- API usage must be visible by tenant, operator, consumer, endpoint, scope, and time range.

---

## 16. MASTER DATA MANAGEMENT ARCHITECTURE

### 16.1 MDM Scope

Master Data Management owns canonical records, identifiers, deduplication, enrichment, governance, and lifecycle for platform master data.

Status: Planned

### 16.2 Master Data Domains

| Domain | Required Controls | Status |
|--------|-------------------|--------|
| Provider Master Data | Canonical provider, aliases, credentials references, capabilities | Planned |
| Operator Master Data | Legal entity, tenant/operator mapping, status, contracts, contacts | Planned |
| Player Master Data | Canonical player identity, profile references, risk tags, privacy controls | Planned |
| Game Master Data | Canonical game, provider mappings, categories, RTP, jurisdictions | Planned |
| Vendor Master Data | Vendor identity, provider relationships, contracts, pricing links | Planned |
| Currency and Country Master Data | Currency precision, country/jurisdiction rules, compliance metadata | Planned |

### 16.3 MDM Rules

- Master records must own canonical IDs.
- Provider/vendor/operator/player/game aliases must map to canonical records.
- Merge and split operations must be permissioned and audited.
- MDM changes must update search, warehouse dimensions, reporting, and downstream caches.

---

## 17. ENTERPRISE DATA GOVERNANCE ARCHITECTURE

### 17.1 Enterprise Data Governance Scope

Data Governance defines ownership, quality, lineage, classification, retention, access, privacy, and audit requirements for operational data, warehouse data, reports, exports, AI datasets, and compliance evidence.

Status: Planned

### 17.2 Governance Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Data Ownership | Business and technical owners for each dataset | Planned |
| Data Stewardship | Named stewards for data quality, definitions, and issue resolution | Planned |
| Data Lineage | Source-to-report and source-to-AI lineage | Planned |
| Data Quality | Freshness, uniqueness, completeness, range, reconciliation checks | Planned |
| Data Retention | Retention by domain, jurisdiction, tenant, and data class | Planned |
| Classification | PII, financial, compliance, operational, public, internal classes | Planned |
| Access Governance | Dataset permissions, exports, approvals, and audit trail | Planned |
| Privacy Controls | Masking, anonymization, DSAR, deletion, legal hold | Planned |
| GDPR Governance | Lawful basis, consent, DSAR, erasure, portability, processing records | Planned |
| PII Management | PII catalog, minimization, masking, tokenization, sensitive export controls | Planned |

### 17.3 Data Governance Rules

- Every governed dataset must have an owner, classification, retention policy, and lineage.
- Exports of sensitive data must be permissioned and audit logged.
- AI datasets must use approved, scoped, and classified sources.
- Data quality failures must block KPI/report publication where material.

---

## 18. DISASTER RECOVERY ARCHITECTURE

### 18.1 Disaster Recovery Scope

Disaster Recovery defines backup, replication, restore, failover, recovery procedures, RPO, RTO, and recovery validation across infrastructure, databases, storage, services, warehouse, and configuration.

Status: Planned

### 18.2 DR Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Backups | PostgreSQL, Redis, ClickHouse, RustFS, R2, configuration, secrets metadata | Planned |
| Replication | Database, object storage, warehouse, and critical configuration replication | Planned |
| Recovery Procedures | Restore runbooks, validation, owners, escalation | Planned |
| RPO | Recovery point objective by system and data class | Planned |
| RTO | Recovery time objective by system and severity | Planned |
| Failover | Database, API, worker, storage, DNS/CDN failover strategy | Planned |
| Restore Drills | Scheduled restore tests and evidence | Planned |

### 18.3 DR Rules

- Backup success alone is insufficient; restore must be tested.
- RPO/RTO must be defined per service and data store.
- Financial, ledger, payment, settlement, and audit data must have stricter recovery controls.
- DR events must create incident records and post-recovery evidence.

---

## 19. RELEASE MANAGEMENT ARCHITECTURE

### 19.1 Release Management Scope

Release Management governs how code, configuration, database migrations, infrastructure, feature flags, and white-label changes move through environments into production.

Status: Planned

### 19.2 Release Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Feature Flags | Scoped flags, kill switches, percentage rollout, tenant/operator targeting | Planned |
| Progressive Rollout | Canary, staged rollout, health-gated promotion | Planned |
| Canary Releases | Limited production exposure with rollback thresholds | Planned |
| Rollback | Application, config, migration, feature flag, and infrastructure rollback plans | Planned |
| Environment Promotion | Development, staging, production promotion with approvals | Planned |
| Release Calendar | Scheduled release windows and blackout periods | Planned |
| Release Evidence | Test results, approvals, changelog, migration plan, rollback plan | Planned |

### 19.3 Release Rules

- Production releases must be traceable to versioned artifacts.
- Feature flags must not become permanent hidden configuration without owner review.
- Migrations must include forward plan, rollback/repair plan, and data verification.
- High-risk releases must include canary metrics and automatic rollback thresholds.

---

## 20. ENTERPRISE DOCUMENT MANAGEMENT ARCHITECTURE

### 20.1 Document Management Scope

Enterprise Document Management governs KYC documents, contracts, invoices, compliance evidence, audit exports, legal files, operator documents, provider documents, and signed agreements.

Status: Planned

### 20.2 Document Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Document Repository | Central repository with owner scope, classification, metadata, and search | Planned |
| Versioning | Immutable versions, current version pointer, compare and rollback | Planned |
| Approval Workflows | Review, approve, reject, request changes, publish, archive | Planned |
| Retention Policies | Retention by document type, jurisdiction, tenant, and legal hold state | Planned |
| Legal Hold | Hold placement, reason, owner, expiry, evidence, release workflow | Planned |
| e-Signature Integration | Contract signing, envelope status, signer identity, signed artifact storage | Planned |
| Access Controls | Document-level RBAC, tenant scope, redaction, signed URL access | Planned |

### 20.3 Document Rules

- Documents must be classified before publication.
- Replacing a document must create a new version, not overwrite the original.
- Legal hold must override deletion and retention expiry.
- Signed documents must preserve signature evidence and audit trail.

---

## 21. ENTERPRISE SCHEDULING ARCHITECTURE

### 21.1 Scheduling Scope

The Enterprise Scheduler centralizes recurring, delayed, and dependency-based jobs across settlements, billing, reports, data sync, campaigns, warehouse pipelines, media jobs, and maintenance operations.

Status: Planned

### 21.2 Scheduled Job Types

| Job Type | Examples | Status |
|----------|----------|--------|
| Settlement Jobs | Provider, vendor, operator, agent, affiliate settlement cycles | Planned |
| Billing Jobs | Invoice generation, payment reminders, aging, credit notes | Planned |
| Report Jobs | Scheduled reports, exports, board packs, compliance reports | Planned |
| Data Sync Jobs | Provider game sync, PSP sync, KYC status sync, warehouse backfill | Planned |
| Campaign Jobs | Campaign start/stop, bonus grant, notification waves | Planned |
| Maintenance Jobs | Retention, cleanup, archive, cache warmup, integrity checks | Planned |

### 21.3 Scheduler Rules

- Jobs must have owner, schedule, timeout, retry policy, idempotency key, and observability.
- Failed jobs must route to dead-letter or exception queues.
- Job execution must support pause, resume, replay, and manual trigger.
- Financial and compliance jobs must produce audit evidence.

---

## 22. FEATURE FLAG ARCHITECTURE

### 22.1 Feature Flag Scope

Feature Flag Architecture controls safe releases, tenant/operator-specific features, experiments, emergency kill switches, and progressive delivery.

Status: Planned

### 22.2 Feature Flag Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Feature Flags | Boolean, variant, config, and permission-aware flags | Planned |
| Gradual Rollout | Percentage rollout, allowlist, cohort rollout, environment gates | Planned |
| A/B Testing | Experiment variants, assignment, metrics, guardrails | Planned |
| Tenant-Specific Features | Tenant and white-label targeting | Planned |
| Operator-Specific Features | Operator targeting and override rules | Planned |
| Emergency Kill Switches | Immediate disablement for risky workflows and integrations | Planned |
| Flag Governance | Owner, expiry, review, cleanup, audit trail | Planned |

### 22.3 Feature Flag Rules

- Flags must have owner and expiry.
- Kill switches must be available for payments, providers, routes, bonuses, campaigns, AI actions, and callbacks.
- Feature flag evaluations must be observable for debugging production behavior.

---

## 23. LOCALIZATION ARCHITECTURE

### 23.1 Localization Scope

Localization governs language packs, translation management, localized CMS, localized promotions, SEO, currency formatting, date/time formatting, and right-to-left support.

Status: Planned

### 23.2 Localization Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Language Packs | UI, content, transactional, marketing, SEO, legal text | Planned |
| Translation Management | Translation workflow, review, missing-key detection, versioning | Planned |
| Localized CMS | Pages, blocks, menus, terms, landing pages by locale | Planned |
| Localized Promotions | Promotion copy, images, targeting, terms, currency copy | Planned |
| Localized SEO | Metadata, slugs, canonical rules, hreflang, sitemap entries | Planned |
| Currency Localization | Symbols, separators, precision, display rules, fallback currency | Planned |
| Locale Rules | Date, time, number, phone, address, RTL/LTR behavior | Planned |

### 23.3 Localization Rules

- White labels must define supported locales and fallback locale.
- Missing translations must be visible before publish.
- Legal and compliance content must support jurisdiction-specific localization approval.

---

## 24. LICENSING AND JURISDICTION ARCHITECTURE

### 24.1 Licensing Scope

Licensing and Jurisdiction Architecture controls iGaming licenses, markets, regulatory packs, country restrictions, game restrictions, provider availability, payment availability, and compliance rules.

Status: Planned

### 24.2 Licensing Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Jurisdictions | Jurisdiction records, market status, regulatory requirements | Planned |
| Licenses | License holder, license scope, expiry, renewal, evidence | Planned |
| Game Restrictions | Game/provider/category blocking by country, license, operator, player | Planned |
| Country Restrictions | Registration, login, deposit, play, withdrawal restrictions | Planned |
| Regulatory Packs | Reusable compliance policies by jurisdiction | Planned |
| Compliance Rules | KYC, AML, RG, tax, reporting, content, payment rules | Planned |
| License Evidence | Documents, approvals, regulator exports, audit trail | Planned |

### 24.3 Licensing Rules

- Jurisdiction checks must run before registration, deposit, launch, bet, bonus, and withdrawal.
- License restrictions must feed routing, provider availability, payment methods, bonuses, and reporting.
- Regulatory packs must be versioned and auditable.

---

## 25. ENTERPRISE CASE MANAGEMENT ARCHITECTURE

### 25.1 Case Management Scope

Enterprise Case Management provides a unified investigation and resolution framework for AML, fraud, responsible gaming, compliance, KYC, payment risk, bonus abuse, and operational exceptions.

Status: Planned

### 25.2 Case Modules

| Module | Requirement | Status |
|--------|-------------|--------|
| Case Intake | Automatic and manual case creation from alerts, rules, events, and tickets | Planned |
| Assignment | Queues, ownership, priority, SLA, reassignment | Planned |
| Investigation | Evidence, notes, timeline, linked entities, risk score, actions | Planned |
| Decisioning | Approve, reject, escalate, close, reopen, monitor | Planned |
| Escalation | SLA breach, severity increase, senior review, legal/compliance escalation | Planned |
| Evidence Pack | Exportable evidence for regulators, audits, and internal review | Planned |

### 25.3 Case Rules

- Cases must support linking player, operator, payment, bonus, device, document, ticket, and transaction records.
- Case actions must be permissioned and audit logged.
- Sensitive case evidence must support redaction and legal hold.

---

## 26. RECONCILIATION ARCHITECTURE

### 26.1 Reconciliation Scope

Reconciliation Architecture compares internal and external financial, provider, settlement, invoice, and ledger records to detect mismatches, resolve exceptions, and produce finance-grade evidence.

Status: Planned

### 26.2 Reconciliation Types

| Type | Requirement | Status |
|------|-------------|--------|
| PSP Reconciliation | PSP deposits, withdrawals, fees, chargebacks, balances | Planned |
| Provider Reconciliation | Bets, wins, refunds, rollbacks, game rounds, provider statements | Planned |
| Settlement Reconciliation | Provider, vendor, operator, agent, affiliate settlement matching | Planned |
| Invoice Reconciliation | Invoices, credit notes, payments, adjustments, collections | Planned |
| Ledger Reconciliation | Wallet ledger, finance ledger, settlement ledger, treasury balances | Planned |
| Exception Management | Breaks, tolerances, assignments, resolution, write-offs | Planned |

### 26.3 Reconciliation Rules

- Every reconciliation run must store source files, query snapshot, differences, owner, and resolution state.
- Tolerances must be configurable and auditable.
- Reconciliation differences must feed case management and finance workflows.

---

## 27. BUSINESS RULES ENGINE ARCHITECTURE

### 27.1 Rules Engine Scope

The Business Rules Engine centralizes configurable business logic so pricing, bonuses, fraud, routing, compliance, and responsible gaming rules can evolve without code changes where safe.

Status: Planned

### 27.2 Rule Domains

| Domain | Rule Examples | Status |
|--------|---------------|--------|
| Pricing Rules | Buy/sell price, margin, revenue share, fee rules | Planned |
| Bonus Rules | Eligibility, wagering, contribution, expiry, reward limits | Planned |
| Fraud Rules | Velocity, device, payment, bonus abuse, geo anomaly | Planned |
| Routing Rules | Route priority, fallback, jurisdiction, provider health, RTP | Planned |
| Compliance Rules | KYC, AML, country blocking, license restrictions | Planned |
| RG Rules | Limits, interventions, self-exclusion, reality checks | Planned |

### 27.3 Rules Engine Rules

- Rules must be versioned, testable, simulatable, and auditable.
- Rule activation must support approval workflow and rollback.
- Rule evaluation results must be explainable for support, compliance, and audit.

---

## 28. CMS AND CONTENT ARCHITECTURE

### 28.1 CMS Scope

CMS and Content Architecture powers white-label content, pages, blocks, promotions, banners, SEO content, landing pages, terms, legal copy, and localized content.

Status: Planned

### 28.2 CMS Modules

| Module | Requirement | Status |
|--------|-------------|--------|
| Pages | Static, dynamic, legal, support, SEO, landing pages | Planned |
| Blocks | Reusable content blocks and page sections | Planned |
| Promotions | Promotion content, targeting, scheduling, terms | Planned |
| Banners | Banner slots, responsive assets, campaign mapping | Planned |
| SEO Content | Metadata, slugs, canonical rules, open graph, schema | Planned |
| Landing Pages | Campaign pages, affiliate pages, geo/locale variants | Planned |
| Publishing | Draft, preview, approval, publish, rollback | Planned |

### 28.3 CMS Rules

- Content publishing must support white-label, locale, jurisdiction, device, and campaign scope.
- Legal and compliance-sensitive content must require approval.
- CMS media must use approved Media Center assets.

---

## 29. PARTNER ECOSYSTEM ARCHITECTURE

### 29.1 Partner Ecosystem Scope

Partner Ecosystem Architecture manages the lifecycle of partners, vendors, providers, resellers, affiliates, API consumers, integration partners, and commercial relationships.

Status: Planned

### 29.2 Partner Domains

| Domain | Requirement | Status |
|--------|-------------|--------|
| Partners | Partner profile, lifecycle, contracts, contacts, risk, status | Planned |
| Vendors | Vendor commercial terms, providers, games, settlements | Planned |
| Providers | Provider onboarding, credentials, health, catalog, settlement | Planned |
| Resellers | Reseller accounts, assigned operators, revenue share | Planned |
| Affiliates | Affiliate campaigns, traffic, commissions, payouts | Planned |
| API Consumers | API onboarding, keys, scopes, usage, compliance | Planned |

### 29.3 Partner Rules

- Partner lifecycle must include onboarding, due diligence, contract, activation, monitoring, renewal, suspension, termination.
- Partner access must be scoped and audited.
- Partner performance must feed reporting, billing, settlement, and risk.

---

## 30. CAPACITY AND SCALABILITY ARCHITECTURE

### 30.1 Capacity Scope

Capacity and Scalability Architecture defines expected load, scaling strategy, performance targets, concurrency targets, and capacity planning across APIs, workers, databases, warehouse, media, AI, providers, PSPs, and white-label traffic.

Status: Planned

### 30.2 Capacity Areas

| Area | Requirement | Status |
|------|-------------|--------|
| Expected Load | Requests, bets, callbacks, payments, reports, media transforms, AI jobs | Planned |
| Scaling Strategy | Horizontal/vertical scaling, queue scaling, database scaling, CDN offload | Planned |
| Capacity Planning | Forecasts, headroom, growth assumptions, seasonal load | Planned |
| Performance Targets | Latency, throughput, queue lag, dashboard response, report generation | Planned |
| Concurrency Targets | Active players, concurrent game sessions, callbacks, workers, operators | Planned |
| Load Testing | k6/playwright/API/worker/load scenarios and baselines | Planned |

### 30.3 Capacity Rules

- Tier-1 workflows must define SLOs and capacity targets.
- Capacity tests must include provider callback bursts and payment spikes.
- Scaling policy must include cost, latency, error rate, and queue depth signals.

---

## 31. SECURITY OPERATIONS ARCHITECTURE

### 31.1 SecOps Scope

Security Operations covers SIEM, threat detection, incident response, security monitoring, vulnerability management, security runbooks, and evidence collection.

Status: Planned

### 31.2 SecOps Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| SIEM | Central security event collection and correlation | Planned |
| Threat Detection | Suspicious login, API abuse, data export, privilege escalation, malware signals | Planned |
| Incident Response | Triage, containment, eradication, recovery, postmortem | Planned |
| Security Monitoring | WAF, auth, API, infra, secrets, vulnerability, dependency monitoring | Planned |
| Vulnerability Management | Scanning, severity, ownership, SLA, remediation evidence | Planned |
| Security Runbooks | Playbooks for credential leak, breach, DDoS, fraud attack, provider compromise | Planned |

### 31.3 SecOps Rules

- Security events must be retained according to compliance policy.
- High-severity security incidents must trigger business continuity and incident communications.
- Vulnerability remediation must have SLA by severity.

---

## 32. BUSINESS CONTINUITY ARCHITECTURE

### 32.1 Business Continuity Scope

Business Continuity ensures operational continuity during incidents, outages, provider failures, payment disruptions, compliance events, cyber incidents, and staffing escalations.

Status: Planned

### 32.2 Continuity Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Operational Continuity | Minimum operating mode for platform, payments, support, finance, compliance | Planned |
| Incident Playbooks | Provider outage, PSP outage, route failure, data incident, cyber event | Planned |
| Runbooks | Step-by-step recovery and manual operations procedures | Planned |
| Escalation Procedures | Severity, ownership, escalation chain, executive notification | Planned |
| Communication Plans | Internal, operator, player, provider, regulator, partner communications | Planned |
| Continuity Drills | Scheduled tabletop and live exercises | Planned |

### 32.3 Business Continuity Rules

- Business continuity is broader than technical disaster recovery.
- Critical workflows must define manual fallback procedures.
- Operator and regulator communications must be versioned and auditable.

---

## 33. ENTERPRISE KPI ARCHITECTURE

### 33.1 KPI Scope

Enterprise KPI Architecture governs KPI definitions, formulas, ownership, source data, thresholds, refresh cadence, and dashboard/report consistency.

Status: Planned

### 33.2 KPI Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| KPI Catalog | Central catalog of business and operational KPIs | Planned |
| KPI Definitions | Formula, owner, source, grain, filters, exclusions | Planned |
| Calculation Rules | SQL/semantic rules, rounding, currency, timezone, attribution | Planned |
| Ownership | Business owner, technical owner, approver | Planned |
| Data Sources | Warehouse facts, dimensions, operational systems, finance ledger | Planned |
| Thresholds | Warning/critical targets, alert rules, SLA/SLO mapping | Planned |
| KPI Governance | Review, change control, deprecation, audit history | Planned |

### 33.3 KPI Rules

- GGR, NGR, RTP, LTV, ARPU, ARPPU, churn, margin, and collection rate must have single governed definitions.
- Dashboard, report, AI, and finance calculations must use the same KPI definitions.
- KPI definition changes must be versioned and communicated.

---

## 34. METADATA ARCHITECTURE

### 34.1 Metadata Scope

Metadata Architecture defines the platform metadata catalog, schema registry, data dictionary, business glossary, API metadata, event metadata, report metadata, and ownership metadata.

Status: Planned

### 34.2 Metadata Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Metadata Catalog | Searchable catalog of datasets, APIs, events, reports, entities | Planned |
| Schema Registry | Versioned event, API, warehouse, and integration schemas | Planned |
| Data Dictionary | Entity, field, type, owner, sensitivity, usage | Planned |
| Business Glossary | Business terms, definitions, examples, owners | Planned |
| API Metadata | Endpoint owner, version, scope, lifecycle, contract | Planned |
| Report Metadata | Report owner, source, metrics, filters, cadence | Planned |

### 34.3 Metadata Rules

- Metadata must link technical assets to business meaning.
- Schema changes must update metadata and compatibility checks.
- Business glossary terms must be reused by KPI, reporting, AI, and docs.

---

## 35. ENTERPRISE INTEGRATION PLATFORM ARCHITECTURE

### 35.1 Integration Platform Scope

Enterprise Integration Platform Architecture defines the shared integration layer for adapters, registries, credentials, transformations, webhooks, payload mapping, monitoring, replay, and lifecycle management.

Status: Planned

### 35.2 Integration Platform Capabilities

| Capability | Requirement | Status |
|------------|-------------|--------|
| Adapter Framework | Common adapter SDK, lifecycle, validation, mocks, contract tests | Planned |
| Integration Registry | Integration catalog, owner, status, environment, capabilities | Planned |
| Webhook Registry | Webhook endpoints, subscriptions, signatures, retries, delivery logs | Planned |
| Credential Vault | Credential references, rotation, environment scope, access audit | Planned |
| Transformation Layer | Mapping, normalization, validation, enrichment, versioning | Planned |
| Integration Monitoring | Health, latency, errors, throughput, dead letters, replay | Planned |
| Integration Lifecycle | Draft, sandbox, certification, active, degraded, suspended, retired | Planned |

### 35.3 Integration Platform Rules

- Integrations must register in the integration registry before activation.
- Transformations must be versioned and replay-safe.
- Credentials must be referenced through vault/secrets systems only.
- Adapter certification must include contract, failure, replay, health, and security tests.

---

# VOLUME 2 - DETAILED IMPLEMENTATION SPECIFICATION

---

## 36. AGGREGATOR PRD

### 36.1 Aggregator Scope

The Aggregator domain controls upstream gaming supply, commercial pricing, provider integrations, routing, callbacks, settlements, and downstream distribution to operators and agents.

### 36.2 Aggregator Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Provider Management | Provider onboarding, provider profile, integration mode, contract, credentials, health, settlement, incident history | Planned |
| Vendor Management | Vendor profile, contracts, pricing, game ownership, vendor/provider relationships, settlement controls | Planned |
| Game Catalog | Game metadata, categories, RTP, volatility, jurisdictions, languages, currencies, thumbnails, status, certification | Planned |
| Operator Management | Operator lifecycle, assigned providers, assigned games, commercial terms, limits, wallets, callback endpoints | Planned |
| Agent Management | Agent hierarchy, assigned operators, commission plans, revenue share, payout controls, fraud review | Planned |
| Buy Price Management | Provider/vendor cost model, minimums, fees, currency rules, hidden from non-owner roles | Planned |
| Sell Price Management | Operator price lists, agent margins, promotional pricing, effective dates, approvals | Planned |
| Routing Engine | Provider route selection, fallback, health-aware routing, jurisdiction rules, operator overrides, RTP controls | Planned |
| RTP Management | Target RTP, actual RTP monitoring, drift alerts, game/provider/operator level reporting | Planned |
| API Management | API keys, scopes, rate limits, IP allowlists, webhook/callback registration, usage analytics | Planned |
| Callback Center | Provider callbacks, operator callbacks, signature validation, replay, dead-letter queue, delivery logs | Planned |
| Provider Health | Uptime, latency, error rate, wallet sync, callback lag, incident tracking, SLA score | Planned |
| Aggregator Settlement | Provider settlement, vendor settlement, operator settlement, agent commission, adjustments, approvals | Planned |
| Compliance Controls | Jurisdiction rules, game blocking, sanctions/geofence policy hooks, audit evidence | Planned |

### 36.3 Provider Architecture Requirements

- Support multiple provider integration types: direct API, vendor API, iframe launch, server-to-server, wallet transfer, seamless wallet.
- Store provider capabilities as versioned configuration.
- Separate provider credentials by environment and operator where required.
- Support provider-specific callback schemas through normalized event ingestion.
- Track provider health by endpoint and route.
- Support provider maintenance windows and incident suppression rules.
- Support provider game sync with diff review before publish.

### 36.4 Vendor Architecture Requirements

- Vendor may own multiple providers or game studios.
- Vendor contract may differ from provider contract.
- Vendor pricing may override or supplement provider pricing.
- Vendor settlement must support revenue share, fixed fee, hybrid fee, and manual adjustment models.

### 36.5 Pricing Requirements

- Buy price and sell price must be separated at database, API, UI, and permission layers.
- Buy price visibility: Owner Admin only.
- Sell price visibility: Owner Admin, Aggregator Admin, scoped Agent, scoped Operator where permitted.
- Pricing must support effective date ranges, currency, game/provider/operator/agent scope, approval state, and audit trail.
- Price calculations must support GGR, NGR, revenue share, CPA, fixed monthly minimums, setup fees, and hybrid pricing.

### 36.6 Routing Requirements

- Route by operator, jurisdiction, game, provider health, cost, margin, RTP target, currency, and failover policy.
- Manual route override must require permission and audit reason.
- Route evaluation must be observable and explainable.
- Failed launches must produce traceable error events.
- Routing rules must support simulation before activation.

---

## 37. ROUTE ARCHITECTURE

### 37.1 Route Architecture Purpose

The Route Architecture controls how players, operators, games, providers, vendors, wallets, currencies, jurisdictions, payments, callbacks, settlements, and APIs are connected across the platform.

Status: Planned

Routing is a Tier-1 aggregator architecture domain. It must be built as a shared platform capability rather than as separate provider, payment, wallet, callback, or settlement-specific logic.

### 37.2 Route Hierarchy

```text
Platform
|
+-- Vendor
|   +-- Provider
|   |   +-- Game
|   |   |   +-- Route
|   |   +-- Route
|   +-- Route Group
|
+-- Operator
|   +-- Provider Pack
|   +-- Game Pack
|   +-- Route Policy
|   +-- RTP Policy
|
+-- Agent
|   +-- Assigned Operators
|
+-- Player
```

### 37.3 Route Types

#### Game Launch Route

```text
Player
  -> Operator
    -> Aggregator
      -> Route Engine
        -> Provider
          -> Game Launch
```

Purpose:

- Select the correct provider/game route for a player session.
- Enforce operator, jurisdiction, game, currency, device, provider health, RTP, and commercial policy.
- Generate traceable launch decisions and launch URLs.

#### Wallet Route

```text
Player Wallet
  -> Wallet Adapter
    -> Provider Wallet
      -> Settlement
```

Supported wallet modes:

- Seamless wallet
- Transfer wallet
- Hybrid wallet

Purpose:

- Select the correct wallet adapter and provider transaction path.
- Preserve idempotency across debit, credit, rollback, balance, and settlement.
- Reconcile wallet route results with provider and ledger records.

#### Callback Route

```text
Provider
  -> Callback Gateway
    -> Validation
      -> Normalization
        -> Ledger
          -> Operator Callback
```

Purpose:

- Validate and normalize provider callbacks.
- Route callback outcomes to ledger, wallet, settlement, operator webhook, reporting, and audit.
- Support replay, dead-letter handling, and operator callback delivery logs.

#### Payment Route

```text
Player
  -> PSP Router
    -> Payment Provider
      -> Settlement
```

Routing factors:

- Country
- Currency
- Amount
- Risk
- Operator
- Payment method
- PSP health
- Settlement cost

### 37.4 Route Decision Engine

| Decision Area | Routing Factors | Status |
|---------------|-----------------|--------|
| Commercial | Buy price, sell price, margin, minimums, revenue share | Planned |
| Technical | Latency, error rate, availability, callback lag, provider health | Planned |
| Regulatory | Jurisdiction, country, compliance status, game certification, player restrictions | Planned |
| Business | Operator preferences, provider priority, vendor priority, revenue share, route group | Planned |
| Financial | Currency, wallet mode, settlement account, treasury exposure, FX policy | Planned |
| Risk | Player risk, fraud score, RG status, payment risk, route incident state | Planned |

Decision requirements:

- Every route decision must produce an explainable `RouteDecisionLog`.
- The decision engine must support dry-run simulation and production evaluation.
- Route decisions must be deterministic for the same input and policy version unless health or availability changes.
- Route decisions must include policy version, selected route, fallback chain, rejection reasons, and decision latency.

### 37.5 Route Policies

| Policy Type | Purpose | Status |
|-------------|---------|--------|
| Global Policy | Platform-wide route rules and safety constraints | Planned |
| Vendor Policy | Vendor-specific rules and commercial constraints | Planned |
| Provider Policy | Provider-specific health, wallet, currency, jurisdiction, and game constraints | Planned |
| Operator Policy | Operator-specific overrides, packs, preferences, route priorities | Planned |
| Game Policy | Game-specific provider, RTP, certification, device, market, or category overrides | Planned |
| Player Policy | Player-specific restrictions, risk, RG, KYC, jurisdiction, and VIP exceptions | Planned |

Policy rules:

- Policies must be versioned.
- Policy activation must require approval for production-impacting changes.
- Higher-specificity policies may override lower-specificity policies only where explicitly allowed.
- Policy evaluation order must be documented and tested.

### 37.6 Route Groups

Route groups organize providers and games into reusable commercial, regional, product, and technical bundles.

Examples:

| Route Group | Example Members | Purpose |
|-------------|-----------------|---------|
| Casino Premium | Pragmatic, Evolution, Hacksaw, PG Soft | Premium casino provider routing |
| Asia Route | JILI, JDB, CQ9, KA Gaming | Asia-focused casino routing |
| Crypto Route | Provider A, Provider B, Provider C | Crypto-friendly provider/payment/wallet routing |
| Low Latency Route | Healthiest low-latency providers | Performance-sensitive markets |
| High Margin Route | Providers with best current margin | Commercial optimization |
| Emergency Route | Approved fallback providers | Incident response routing |

### 37.7 Route Priority Model

Priority chain:

```text
Primary Route
  -> Fallback Route
    -> Backup Route
      -> Emergency Route
```

Example:

```text
Pragmatic
  -> PG Soft
    -> Amusnet
```

Priority rules:

- Primary route is used when all policy, health, jurisdiction, wallet, and commercial checks pass.
- Fallback route is used when the primary route is unavailable, disallowed, or fails health checks.
- Backup route is used when both primary and fallback are unavailable or below threshold.
- Emergency route is used only during incident state, maintenance state, or approved override.

### 37.8 Route Monitoring

| Metric | Purpose | Status |
|--------|---------|--------|
| Route Latency | Measure launch/callback/payment/wallet route response time | Planned |
| Route Errors | Track route failures and rejection reasons | Planned |
| Route Success Rate | Track successful route decisions and downstream completions | Planned |
| Route Revenue | Track revenue by route, provider, game, operator, and route group | Planned |
| Route Margin | Track margin after buy price, sell price, fees, and adjustments | Planned |
| Route RTP | Track expected vs actual RTP by route | Planned |
| Route Availability | Track route health and provider availability | Planned |

Monitoring rules:

- Route dashboards must support provider, vendor, operator, game, jurisdiction, currency, and time filters.
- Route incidents must link to provider health, callback errors, payment failures, and player impact.
- Route degradation must be eligible for automated fallback if policy allows.

### 37.9 Route Simulation

Activation flow:

```text
Draft Route
  -> Simulation
    -> Margin Check
      -> RTP Check
        -> Health Check
          -> Approval
            -> Production
```

Simulation requirements:

- Simulate by operator, game, provider, vendor, jurisdiction, currency, player cohort, and wallet mode.
- Compare current route vs proposed route.
- Estimate margin, revenue, latency, RTP drift, provider load, player impact, and fallback behavior.
- Store simulation inputs, results, approver, and activation decision.

### 37.10 Route Database

| Entity | Purpose | Status |
|--------|---------|--------|
| RouteGroup | Reusable group of routes/providers/games | Planned |
| RoutePolicy | Route policy definition | Planned |
| RoutePolicyVersion | Versioned route policy | Planned |
| RouteCondition | Declarative condition used by policy | Planned |
| RoutePriority | Ordered priority model | Planned |
| RouteFallback | Fallback chain definition | Planned |
| RouteHealth | Current route health state | Planned |
| RoutePerformance | Route metrics and rollups | Planned |
| RouteAssignment | Operator/game/provider/player assignment to policy or group | Planned |
| RouteSimulationResult | Simulation result and approval metadata | Planned |
| RouteDecisionLog | Explainable route decision record | Planned |
| RouteOverride | Manual or emergency route override | Planned |

### 37.11 Route APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/routes` | Route CRUD and lookup | Planned |
| `/api/routes/groups` | Route group management | Planned |
| `/api/routes/policies` | Route policy management | Planned |
| `/api/routes/simulations` | Route simulations | Planned |
| `/api/routes/health` | Route health state | Planned |
| `/api/routes/analytics` | Route analytics and performance | Planned |
| `/api/routes/overrides` | Manual and emergency overrides | Planned |
| `/api/routes/fallbacks` | Fallback chain configuration | Planned |

### 37.12 Route Dashboard

Navigation:

```text
Aggregator
  -> Route Center
```

Required pages:

| Page | Purpose | Status |
|------|---------|--------|
| Route Overview | Route health, KPIs, active policies, incidents | Planned |
| Route Builder | Build route policies, conditions, priorities, fallbacks | Planned |
| Route Groups | Manage commercial/regional/product route groups | Planned |
| Route Policies | Manage policy versions and approvals | Planned |
| Route Monitoring | Live route health and error monitoring | Planned |
| Route Analytics | Revenue, margin, RTP, latency, success rate analytics | Planned |
| Route Simulations | Run and compare simulations before activation | Planned |
| Route Incidents | Route degradation, override, fallback, and incident history | Planned |

### 37.13 Route Consistency Rules

- Game launch, wallet, callback, payment, and settlement routing must share the same route policy model where applicable.
- Provider-specific route behavior must be isolated behind adapter contracts.
- Route overrides must require permission, reason, expiry, and audit trail.
- Route policy changes must be versioned and replayable against historical decisions.
- Route analytics must reconcile to provider health, ledger, settlement, and warehouse data.
- Developers must not implement route-specific logic inside unrelated modules without using the Route Architecture contract.

---

## 38. B2B PRD

### 38.1 B2B Scope

The B2B domain controls white-label operations, operator administration, CRM, billing, compliance, support, affiliates, and business reporting.

### 38.2 B2B Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| White Label Studio | Theme builder, brand assets, domains, menus, homepage builder, promotions builder, payment packs, provider packs, language packs, SEO settings, mobile app branding | Planned |
| Operator CRM | Operator accounts, contacts, lifecycle stage, notes, tasks, opportunities, renewals, risk flags | Planned |
| Billing | Invoices, credit notes, tax rules, payment status, billing periods, operator charges, agent commissions | Planned |
| Compliance | Operator due diligence, document collection, jurisdiction approvals, legal entity checks, compliance evidence | Planned |
| KYC Operations | Player KYC queues, vendor checks, manual review, escalation, evidence storage | Planned |
| Support Center | Tickets, conversations, macros, SLA, assignments, player/operator context, audit history | Planned |
| Affiliate Management | Affiliate profiles, campaigns, links, tracking, commission plans, payouts, fraud checks | Planned |
| Reporting | Operator P&L, GGR/NGR, provider performance, payment performance, campaign performance, compliance reports | Planned |
| Contract Management | Operator agreements, provider packs, pricing schedules, renewal dates, approvals | Planned |
| Notification Center | Email, SMS, push, in-app, webhook templates and delivery logs | Planned |

### 38.3 White Label Requirements

- White label must be configurable without code deployment.
- White label output must support web and future mobile app branding.
- Each white label must map to one or more domains and operator scopes.
- Theme changes must support draft, preview, approval, publish, rollback.
- Provider packs and payment packs must be assignable per white label.
- Language packs must support localized menus, pages, promotions, SEO metadata, and transactional content.

### 38.4 Billing Requirements

- Billing must support operator invoices, provider charges, vendor charges, agent commissions, affiliate commissions, manual adjustments, taxes, and credit notes.
- Billing calculations must be reproducible from ledger and event data.
- Billing periods must support draft, review, approved, issued, paid, disputed, voided.
- Billing exports must include CSV, PDF, and accounting-system integration hooks.

---

## 39. B2C PRD

### 39.1 B2C Scope

The B2C domain controls player lifecycle, wallets, payments, bonuses, VIP, marketing, tournaments, responsible gaming, and player support.

### 39.2 B2C Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Player Management | Registration, profile, status, risk level, tags, notes, documents, account history | Planned |
| Wallet System | Multi-currency wallets, double-entry ledger, balance types, holds, bonus balance, reconciliation | Planned |
| Payments | Deposits, withdrawals, PSP routing, payment methods, callbacks, fraud checks, settlement | Planned |
| Bonus Engine | Bonus templates, wagering rules, free spins, cashback, lossback, eligibility, abuse controls | Planned |
| VIP | VIP tiers, manual upgrades, host assignment, rewards, limits, communication history | Planned |
| Marketing | Segments, campaigns, journeys, templates, channels, suppression, attribution, analytics | Planned |
| Tournaments | Tournament setup, qualification, leaderboard, prize rules, settlement, fraud controls | Planned |
| Responsible Gaming | Deposit limits, loss limits, wager limits, time limits, self-exclusion, cooling-off, interventions | Planned |
| Player Support | Tickets, chat context, transaction view, KYC view, responsible gaming warnings | Planned |
| Player Risk | AML alerts, bonus abuse, payment risk, multi-accounting, velocity rules, manual review | Planned |

### 39.3 Wallet Architecture Requirements

- All financial movement must use double-entry ledger entries.
- Wallet balance types: cash, bonus, locked, pending withdrawal, adjustment, promotional credit.
- Every write must be idempotent.
- Ledger entries must be immutable after posting.
- Reversals must be represented as new ledger entries.
- Wallet transactions must reference source event, operator, player, currency, and idempotency key.
- Reconciliation must compare payment provider data, provider game data, ledger entries, and settlement records.

### 39.4 Payment Architecture Requirements

- PSP routing must support operator, currency, country, payment method, amount, risk score, and provider health.
- Deposit and withdrawal flows must include pending, processing, approved, rejected, failed, canceled, reversed states.
- Payment callbacks must be signed, idempotent, replayable, and auditable.
- Withdrawal approval must support configurable thresholds and segregation of duties.

---

## 40. DATABASE ARCHITECTURE

### 40.1 Database Principles

- PostgreSQL is the transactional source of truth.
- ClickHouse is used for analytics and event rollups.
- Redis is used for cache, queue coordination, locks, and ephemeral state.
- Schema changes must be migration-based.
- Financial data must be append-only where required by ledger rules.
- Tenant, operator, and scope identifiers must exist on all scoped records.
- Critical mutations must write audit records.

### 40.2 Aggregator Database

| Entity | Purpose | Status |
|--------|---------|--------|
| Provider | Master provider profile | Planned |
| ProviderCredential | Environment-scoped provider credentials | Planned |
| ProviderContract | Provider commercial/legal terms | Planned |
| ProviderPricing | Buy price, fee, revenue share, minimums | Planned |
| ProviderPricingVersion | Versioned provider pricing history | Planned |
| ProviderHealth | Current provider health snapshot | Planned |
| ProviderHealthMetric | Time-series provider health measurements | Planned |
| ProviderIncident | Provider outage, degradation, SLA incident | Planned |
| ProviderMaintenanceWindow | Planned maintenance schedule | Planned |
| ProviderSettlement | Provider settlement cycle | Planned |
| ProviderSettlementLine | Provider settlement line items | Planned |
| ProviderCallback | Raw provider callback event | Planned |
| ProviderCallbackDelivery | Callback processing and replay state | Planned |
| ProviderGameSyncJob | Game catalog sync job | Planned |
| ProviderGameSyncDiff | Reviewable game catalog changes | Planned |
| Vendor | Vendor/studio/business profile | Planned |
| VendorContract | Vendor legal and commercial terms | Planned |
| VendorPricing | Vendor pricing and revenue share terms | Planned |
| VendorSettlement | Vendor settlement cycle | Planned |
| Game | Master game record | Planned |
| GameProvider | Provider-specific game mapping | Planned |
| GameVendor | Vendor/game studio mapping | Planned |
| GameCertification | Jurisdiction certification record | Planned |
| GameMedia | Game image and media mapping | Planned |
| GameRtpProfile | Expected RTP and volatility metadata | Planned |
| GameRoute | Route option for game/provider/operator | Planned |
| Operator | Operator account in aggregator context | Planned |
| OperatorProvider | Provider enabled for operator | Planned |
| OperatorGame | Game enabled for operator | Planned |
| OperatorPricing | Sell price and commercial terms | Planned |
| OperatorPricingVersion | Versioned operator pricing history | Planned |
| OperatorWallet | Operator settlement wallet | Planned |
| OperatorCallbackEndpoint | Operator webhook/callback config | Planned |
| OperatorApiKey | Operator API key metadata | Planned |
| OperatorLimit | Operator-level launch/payment/risk limits | Planned |
| Agent | Agent profile and commercial assignment | Planned |
| AgentOperator | Agent-to-operator assignment | Planned |
| AgentCommissionPlan | Agent commission model | Planned |
| AgentCommissionLedger | Agent commission accruals | Planned |
| RoutingRule | Declarative route rule | Planned |
| RoutingRuleVersion | Versioned routing rule history | Planned |
| RoutingSimulation | Pre-activation route simulation | Planned |
| RouteGroup | Reusable route group for providers/games/operators | Planned |
| RoutePolicy | Route policy definition | Planned |
| RoutePolicyVersion | Versioned route policy | Planned |
| RouteCondition | Declarative route condition | Planned |
| RoutePriority | Route priority chain | Planned |
| RouteFallback | Fallback route definition | Planned |
| RouteHealth | Current route health state | Planned |
| RoutePerformance | Route performance metric rollup | Planned |
| RouteAssignment | Route assignment to operator/game/provider/player scope | Planned |
| RouteSimulationResult | Stored route simulation result | Planned |
| RouteDecisionLog | Explainable route decision log | Planned |
| RouteOverride | Manual or emergency route override | Planned |
| RtpMonitor | Actual RTP monitoring record | Planned |
| RtpAlert | RTP drift and threshold alert | Planned |
| ApiClient | API consumer/client metadata | Planned |
| ApiScope | API permission scope | Planned |
| ApiUsageMetric | API usage and quota metrics | Planned |

### 40.3 B2B Database

| Entity | Purpose | Status |
|--------|---------|--------|
| WhiteLabel | White-label root configuration | Planned |
| WhiteLabelDomain | Domain mapping and SSL state | Planned |
| WhiteLabelTheme | Theme configuration | Planned |
| WhiteLabelThemeVersion | Draft/published theme versions | Planned |
| WhiteLabelBrandAsset | Logos, icons, favicons, app images | Planned |
| WhiteLabelMenu | Navigation definition | Planned |
| WhiteLabelPage | CMS/static page definition | Planned |
| WhiteLabelHomepageSection | Homepage builder section | Planned |
| WhiteLabelPromotionSlot | Promotion placement | Planned |
| WhiteLabelPaymentPack | Payment methods enabled for label | Planned |
| WhiteLabelProviderPack | Provider/game pack enabled for label | Planned |
| WhiteLabelLanguagePack | Localization pack | Planned |
| WhiteLabelSeoSetting | SEO metadata and indexing rules | Planned |
| WhiteLabelMobileBranding | Mobile app branding config | Planned |
| OperatorCrmAccount | B2B CRM account | Planned |
| OperatorCrmContact | Operator contact | Planned |
| OperatorCrmActivity | Calls, emails, notes, tasks | Planned |
| OperatorCrmOpportunity | Sales/expansion opportunity | Planned |
| OperatorContract | Operator agreement | Planned |
| OperatorContractVersion | Versioned contract terms | Planned |
| Invoice | Invoice header | Planned |
| InvoiceLine | Invoice line item | Planned |
| CreditNote | Credit note header | Planned |
| CreditNoteLine | Credit note line item | Planned |
| BillingPeriod | Billing period lifecycle | Planned |
| BillingAdjustment | Manual billing adjustment | Planned |
| TaxRule | Tax rule and jurisdiction mapping | Planned |
| SupportTicket | Support ticket | Planned |
| SupportConversation | Message thread | Planned |
| SupportMacro | Reusable response macro | Planned |
| SupportSlaPolicy | SLA and escalation policy | Planned |
| Affiliate | Affiliate profile | Planned |
| AffiliateCampaign | Affiliate campaign | Planned |
| AffiliateTrackingLink | Tracking link and token | Planned |
| AffiliateCommissionPlan | Affiliate commission model | Planned |
| AffiliatePayout | Affiliate payout cycle | Planned |
| ComplianceReview | Operator or player compliance review | Planned |
| ComplianceDocument | Compliance document metadata | Planned |
| KycCase | KYC review case | Planned |
| KycDocument | KYC document metadata | Planned |
| KycProviderCheck | External KYC check result | Planned |

### 40.4 B2C Database

| Entity | Purpose | Status |
|--------|---------|--------|
| Player | Player account | Planned |
| PlayerProfile | Personal profile data | Planned |
| PlayerStatusHistory | Status and lock history | Planned |
| PlayerTag | Player tagging | Planned |
| PlayerNote | Internal player note | Planned |
| PlayerDocument | Player document metadata | Planned |
| PlayerSession | Player auth/session record | Planned |
| Wallet | Player wallet | Planned |
| WalletAccount | Ledger account by balance type | Planned |
| WalletLedgerEntry | Immutable ledger entry | Planned |
| WalletTransaction | Transaction envelope | Planned |
| WalletHold | Holds and reservations | Planned |
| WalletAdjustment | Manual adjustment request | Planned |
| ReconciliationRun | Reconciliation job | Planned |
| ReconciliationDifference | Reconciliation mismatch | Planned |
| Payment | Payment transaction | Planned |
| PaymentMethod | Player payment method | Planned |
| PaymentProvider | PSP configuration | Planned |
| PaymentRoute | PSP routing rule | Planned |
| PaymentCallback | PSP callback event | Planned |
| WithdrawalRequest | Withdrawal approval workflow | Planned |
| BonusTemplate | Bonus configuration | Planned |
| BonusInstance | Player bonus instance | Planned |
| BonusWageringRule | Wagering requirement | Planned |
| BonusLedger | Bonus balance movement | Planned |
| FreeSpinGrant | Free spin grant | Planned |
| VipTier | VIP tier definition | Planned |
| PlayerVipStatus | Player VIP status | Planned |
| VipReward | VIP reward | Planned |
| Campaign | Marketing campaign | Planned |
| Segment | Player segment | Planned |
| CampaignAudience | Campaign audience snapshot | Planned |
| MessageTemplate | Message template | Planned |
| MessageDelivery | Delivery event | Planned |
| Tournament | Tournament definition | Planned |
| TournamentEntry | Player tournament entry | Planned |
| TournamentLeaderboard | Leaderboard snapshot | Planned |
| ResponsibleGamingLimit | Player RG limit | Planned |
| SelfExclusion | Self-exclusion record | Planned |
| CoolingOffPeriod | Cooling-off record | Planned |
| AmlAlert | AML alert | Planned |
| RiskScore | Player risk score | Planned |
| RiskReview | Manual risk review | Planned |

### 40.5 Platform Core Database

| Entity | Purpose | Status |
|--------|---------|--------|
| Tenant | Tenant root | Planned |
| AdminUser | Back-office user | Planned |
| Role | RBAC role | Planned |
| Permission | RBAC permission | Planned |
| RolePermission | Role-to-permission mapping | Planned |
| UserRole | User-to-role mapping | Planned |
| ScopeAssignment | Tenant/operator/agent/provider scope assignment | Planned |
| Session | Admin session | Planned |
| MfaFactor | MFA factor | Planned |
| ApiToken | Internal service/API token | Planned |
| AuditLog | Immutable audit event | Planned |
| AuditLogDetail | Structured audit diff | Planned |
| FeatureFlag | Feature flag | Planned |
| SystemSetting | System configuration | Planned |
| Notification | In-app notification | Planned |
| NotificationPreference | Notification preference | Planned |
| WebhookSubscription | Webhook subscription | Planned |
| WebhookDelivery | Webhook delivery log | Planned |
| WorkflowDefinition | Workflow definition | Planned |
| WorkflowInstance | Workflow runtime instance | Planned |
| ApprovalRequest | Approval workflow record | Planned |
| FileObject | Stored file metadata | Planned |

### 40.6 Media and AI Database

| Entity | Purpose | Status |
|--------|---------|--------|
| MediaAsset | Asset root record | Planned |
| MediaVersion | Versioned asset file | Planned |
| MediaFolder | Folder hierarchy | Planned |
| MediaTag | Asset tag | Planned |
| MediaAssetTag | Asset-to-tag mapping | Planned |
| MediaCollection | Grouped asset collection | Planned |
| MediaTransformation | Transform recipe and output | Planned |
| MediaApproval | Approval workflow | Planned |
| MediaUsage | Where asset is used | Planned |
| MediaDeliveryLog | CDN/delivery event | Planned |
| MediaOptimizationJob | Compression/resize job | Planned |
| MediaBackgroundRemovalJob | Background removal job | Planned |
| MediaAiGeneration | AI generation output | Planned |
| MediaAiPrompt | Prompt and model metadata | Planned |
| AiConversation | Copilot conversation | Planned |
| AiMessage | Copilot message | Planned |
| AiToolCall | AI tool call trace | Planned |
| AiInsight | Persisted AI insight | Planned |
| AiUsageMetric | Token/cost/usage metric | Planned |

### 40.7 Enterprise Domain Database Additions

| Domain | Entity | Purpose | Status |
|--------|--------|---------|--------|
| Finance | LedgerBook | Accounting book by tenant/business unit | Planned |
| Finance | LedgerAccount | Chart of accounts record | Planned |
| Finance | LedgerJournal | Journal header | Planned |
| Finance | LedgerJournalLine | Journal debit/credit line | Planned |
| Finance | AccountingPeriod | Period open/close state | Planned |
| Finance | RevenueRecognitionRule | Revenue recognition rule | Planned |
| Finance | FxRate | Exchange rate by source and effective time | Planned |
| Finance | TreasuryAccount | Bank, PSP, crypto, reserve, or internal account | Planned |
| Finance | TreasuryMovement | Treasury transfer or balance movement | Planned |
| IAM | IdentityProvider | SSO/OAuth/SAML provider configuration | Planned |
| IAM | ServiceAccount | Machine identity and service credential metadata | Planned |
| IAM | ApiCredential | API key, OAuth client, or signed request credential | Planned |
| IAM | MfaPolicy | MFA enforcement policy | Planned |
| IAM | PrivilegedAccessSession | Break-glass access session | Planned |
| Events | DomainEvent | Internal business event record | Planned |
| Events | IntegrationEvent | External or adapter-facing event record | Planned |
| Events | EventSchema | Versioned event contract | Planned |
| Events | EventSubscription | Consumer subscription and routing | Planned |
| Events | EventDeadLetter | Dead-lettered event and retry metadata | Planned |
| Events | EventReplayJob | Event replay request and state | Planned |
| Events | OutboxMessage | Transactional outbox message | Planned |
| Integration Gateway | IntegrationGateway | Gateway definition and ownership | Planned |
| Integration Gateway | GatewayAdapter | Provider/PSP/KYC/messaging/AI adapter metadata | Planned |
| Integration Gateway | GatewayCredential | Environment-scoped gateway credential reference | Planned |
| Integration Gateway | GatewayHealth | Gateway health snapshot | Planned |
| Integration Gateway | GatewayDeadLetter | Failed external payload or delivery | Planned |
| Workflow | WorkflowDefinitionVersion | Versioned workflow definition | Planned |
| Workflow | WorkflowTask | Human or automated workflow task | Planned |
| Workflow | WorkflowTimer | SLA timer and deadline state | Planned |
| Workflow | WorkflowEscalation | Escalation record | Planned |
| Workflow | ApprovalChain | Approval chain definition | Planned |
| Configuration | ConfigurationSet | Versioned configuration set | Planned |
| Configuration | ConfigurationValue | Scoped configuration value | Planned |
| Configuration | ConfigurationVersion | Configuration version history | Planned |
| Configuration | ConfigurationApproval | Configuration approval record | Planned |
| Configuration | FeatureFlagRule | Feature flag rollout rule | Planned |
| API Management | ApiCatalogEntry | API catalog entry | Planned |
| API Management | ApiVersion | API version lifecycle record | Planned |
| API Management | ApiConsumer | API consumer profile | Planned |
| API Management | ApiPolicy | API auth, scope, rate, quota policy | Planned |
| API Management | ApiUsageLog | API usage analytics record | Planned |
| MDM | MasterProvider | Canonical provider master record | Planned |
| MDM | MasterOperator | Canonical operator master record | Planned |
| MDM | MasterPlayer | Canonical player master record | Planned |
| MDM | MasterGame | Canonical game master record | Planned |
| MDM | MasterVendor | Canonical vendor master record | Planned |
| MDM | MasterDataAlias | Alias-to-canonical mapping | Planned |
| MDM | MasterDataMerge | Merge/split audit record | Planned |
| Data Governance | DataOwner | Dataset owner mapping | Planned |
| Data Governance | DataRetentionPolicy | Dataset retention policy | Planned |
| Data Governance | DataQualityRule | Dataset quality rule | Planned |
| Data Governance | DataAccessGrant | Dataset access grant | Planned |
| Disaster Recovery | RecoveryPlan | DR plan by service/data class | Planned |
| Disaster Recovery | RecoveryDrill | Restore/failover drill record | Planned |
| Disaster Recovery | BackupPolicy | Backup policy definition | Planned |
| Disaster Recovery | BackupSnapshot | Backup snapshot metadata | Planned |
| Disaster Recovery | FailoverEvent | Failover event and validation state | Planned |
| Release Management | Release | Release record | Planned |
| Release Management | ReleaseArtifact | Versioned release artifact | Planned |
| Release Management | ReleaseApproval | Release approval evidence | Planned |
| Release Management | RolloutPlan | Progressive rollout or canary plan | Planned |
| Release Management | RollbackPlan | Rollback plan and trigger conditions | Planned |
| Document Management | Document | Document repository record | Planned |
| Document Management | DocumentVersion | Versioned document artifact | Planned |
| Document Management | DocumentApproval | Document approval workflow state | Planned |
| Document Management | LegalHold | Legal hold record | Planned |
| Document Management | ESignatureEnvelope | E-signature envelope and status | Planned |
| Scheduling | ScheduledJob | Job definition and owner | Planned |
| Scheduling | ScheduledJobRun | Job execution record | Planned |
| Scheduling | JobDependency | Job dependency graph | Planned |
| Scheduling | JobDeadLetter | Failed scheduled job payload | Planned |
| Feature Flags | FeatureFlag | Feature flag definition | Planned |
| Feature Flags | FeatureFlagVariant | Feature flag variant | Planned |
| Feature Flags | FeatureExperiment | A/B test or experiment | Planned |
| Feature Flags | FeatureEvaluationLog | Feature evaluation audit/debug record | Planned |
| Localization | LanguagePack | Locale package | Planned |
| Localization | TranslationKey | Translatable key | Planned |
| Localization | TranslationValue | Localized translation value | Planned |
| Localization | LocalizedSeoEntry | Localized SEO metadata | Planned |
| Licensing | Jurisdiction | Jurisdiction/market record | Planned |
| Licensing | License | License record | Planned |
| Licensing | RegulatoryPack | Reusable jurisdiction rule pack | Planned |
| Licensing | GameRestriction | Game/provider/country restriction | Planned |
| Licensing | CountryRestriction | Country-level access/payment/play restriction | Planned |
| Case Management | Case | Unified investigation case | Planned |
| Case Management | CaseEvidence | Case evidence item | Planned |
| Case Management | CaseAction | Case action or decision | Planned |
| Case Management | CaseSla | Case SLA state | Planned |
| Reconciliation | ReconciliationRun | Reconciliation run | Planned |
| Reconciliation | ReconciliationSource | Internal/external reconciliation source | Planned |
| Reconciliation | ReconciliationDifference | Difference/break record | Planned |
| Reconciliation | ReconciliationResolution | Resolution/write-off/escalation record | Planned |
| Rules Engine | BusinessRule | Rule definition | Planned |
| Rules Engine | BusinessRuleVersion | Versioned rule | Planned |
| Rules Engine | RuleEvaluationLog | Rule evaluation result | Planned |
| Rules Engine | RuleSimulation | Rule simulation result | Planned |
| CMS | CmsPage | CMS page | Planned |
| CMS | CmsBlock | Reusable content block | Planned |
| CMS | CmsPromotion | CMS promotion content | Planned |
| CMS | CmsBanner | Banner content slot | Planned |
| CMS | CmsPublishJob | Publish/rollback job | Planned |
| Partner Ecosystem | Partner | Partner profile | Planned |
| Partner Ecosystem | PartnerLifecycleEvent | Partner lifecycle event | Planned |
| Partner Ecosystem | PartnerContract | Partner contract | Planned |
| Partner Ecosystem | PartnerApiConsumer | Partner API consumer mapping | Planned |
| Capacity | CapacityPlan | Capacity plan and assumptions | Planned |
| Capacity | LoadTestRun | Load/performance test run | Planned |
| Capacity | CapacityMetric | Capacity metric snapshot | Planned |
| SecOps | SecurityIncident | Security incident record | Planned |
| SecOps | ThreatSignal | Threat detection signal | Planned |
| SecOps | VulnerabilityFinding | Vulnerability finding | Planned |
| SecOps | SecurityRunbook | Security runbook metadata | Planned |
| Business Continuity | ContinuityPlan | Business continuity plan | Planned |
| Business Continuity | ContinuityPlaybook | Continuity playbook | Planned |
| Business Continuity | CommunicationPlan | Incident communication plan | Planned |
| Business Continuity | ContinuityDrill | Continuity drill record | Planned |
| KPI Governance | KpiDefinition | Governed KPI definition | Planned |
| KPI Governance | KpiThreshold | KPI warning/critical threshold | Planned |
| KPI Governance | KpiCalculationRule | KPI calculation rule | Planned |
| Metadata | MetadataCatalogEntry | Metadata catalog entry | Planned |
| Metadata | SchemaRegistryEntry | Schema registry entry | Planned |
| Metadata | DataDictionaryEntry | Data dictionary entry | Planned |
| Metadata | BusinessGlossaryTerm | Business glossary term | Planned |
| Integration Platform | IntegrationRegistryEntry | Integration registry entry | Planned |
| Integration Platform | WebhookRegistryEntry | Webhook registry entry | Planned |
| Integration Platform | TransformationMapping | Transformation/mapping definition | Planned |
| Integration Platform | AdapterCertification | Adapter certification record | Planned |
| Warehouse | DataPipelineRun | ETL/ELT run metadata | Planned |
| Warehouse | DataQualityCheck | Data quality validation result | Planned |
| Warehouse | MetricDefinition | Governed KPI/metric definition | Planned |
| Warehouse | RawEvent | Immutable raw event | Planned |
| Warehouse | RawCallback | Immutable raw callback event | Planned |
| Warehouse | RawPayment | Immutable raw payment event | Planned |
| Warehouse | RawProviderEvent | Immutable provider event | Planned |
| Warehouse | RawWalletEvent | Immutable wallet event | Planned |
| Warehouse | RawCrmEvent | Immutable CRM event | Planned |
| Warehouse | RawMediaEvent | Immutable media event | Planned |
| Warehouse | FactBet | Bet-level analytics fact | Planned |
| Warehouse | FactGameRound | Game round analytics fact | Planned |
| Warehouse | FactWalletTransaction | Wallet and ledger movement fact | Planned |
| Warehouse | FactPayment | Payment analytics fact | Planned |
| Warehouse | FactBonus | Bonus cost and wagering fact | Planned |
| Warehouse | FactAffiliateCommission | Affiliate commission fact | Planned |
| Warehouse | FactSettlement | Settlement analytics fact | Planned |
| Warehouse | FactInvoice | Invoice analytics fact | Planned |
| Warehouse | FactCampaign | Campaign analytics fact | Planned |
| Warehouse | FactMediaUsage | Media usage analytics fact | Planned |
| Warehouse | DimPlayer | Player dimension | Planned |
| Warehouse | DimOperator | Operator dimension | Planned |
| Warehouse | DimAgent | Agent dimension | Planned |
| Warehouse | DimProvider | Provider dimension | Planned |
| Warehouse | DimVendor | Vendor dimension | Planned |
| Warehouse | DimGame | Game dimension | Planned |
| Warehouse | DimCurrency | Currency dimension | Planned |
| Warehouse | DimCountry | Country/jurisdiction dimension | Planned |
| Warehouse | DimTime | Time dimension | Planned |
| Warehouse | DimWhiteLabel | White-label dimension | Planned |
| Warehouse | ProviderKpi | Provider KPI cube | Planned |
| Warehouse | OperatorKpi | Operator KPI cube | Planned |
| Warehouse | AgentKpi | Agent KPI cube | Planned |
| Warehouse | PlayerKpi | Player KPI cube | Planned |
| Warehouse | FinancialKpi | Financial KPI cube | Planned |
| Warehouse | ComplianceKpi | Compliance KPI cube | Planned |
| Warehouse | ExecutiveDashboard | Executive dashboard dataset | Planned |
| Warehouse | BoardReport | Board report dataset | Planned |
| Warehouse | FinancialSummary | Financial summary dataset | Planned |
| Warehouse | InvestorReport | Investor report dataset | Planned |
| Warehouse | DataCatalogEntry | Dataset catalog entry | Planned |
| Warehouse | DataLineageEdge | Dataset lineage edge | Planned |
| Warehouse | DataClassification | Dataset classification | Planned |
| Reporting | ReportDefinition | Report configuration and owner | Planned |
| Reporting | ReportSchedule | Scheduled report delivery | Planned |
| Reporting | ReportExport | Generated report export | Planned |
| Notification | NotificationTemplate | Versioned notification template | Planned |
| Notification | NotificationDelivery | Channel delivery record | Planned |
| Notification | NotificationSuppression | Opt-out, quiet hours, compliance suppression | Planned |
| Fraud | FraudRule | Fraud rule definition | Planned |
| Fraud | FraudSignal | Atomic fraud signal | Planned |
| Fraud | FraudCase | Investigation case | Planned |
| Responsible Gaming | ResponsibleGamingLimit | Deposit/loss/wager/session limit | Planned |
| Responsible Gaming | InterventionCase | RG intervention workflow | Planned |
| Observability | Incident | Incident lifecycle record | Planned |
| Observability | SloDefinition | SLO definition and target | Planned |
| DevOps | DeploymentRecord | Deployment/release record | Planned |
| DevOps | BackupRun | Backup and restore test metadata | Planned |
| Multi-Tenant | Tenant | Platform, aggregator, operator, or white-label tenant | Planned |
| Multi-Tenant | TenantIsolationPolicy | Isolation and access policy | Planned |
| Sportsbook | SportEvent | Sports event/fixture | Planned |
| Sportsbook | SportsMarket | Market definition | Planned |
| Sportsbook | SportsOdds | Odds snapshot/history | Planned |
| Sportsbook | SportsBet | Sports bet ticket | Planned |
| Sportsbook | SportsSettlement | Settlement/resettlement record | Planned |
| Bonus | BonusAbuseSignal | Bonus abuse detection signal | Planned |
| Mobile | MobileAppConfig | White-label app configuration | Planned |
| Mobile | MobileDevice | Registered mobile device/push token | Planned |
| Search | SearchIndexJob | Search indexing job | Planned |
| Search | SavedSearch | User/team saved search | Planned |
| Audit | AuditIntegrityCheck | Tamper detection result | Planned |
| Audit | SensitiveActionReview | High-risk action review | Planned |

---

## 41. API ARCHITECTURE

### 41.1 API Principles

- Contract-first, versioned APIs.
- All write APIs require idempotency where duplicate requests could cause financial, callback, or workflow duplication.
- All APIs must enforce RBAC and scope before business logic.
- All APIs must emit request IDs, structured logs, metrics, and audit events where required.
- Public/operator APIs must use stronger rate limits and API key scopes.

### 41.2 Aggregator APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/aggregator/providers` | Provider CRUD, profile, credentials, contracts | Planned |
| `/api/aggregator/providers/{providerId}/pricing` | Provider buy price and commercial terms | Planned |
| `/api/aggregator/providers/{providerId}/health` | Health metrics and incidents | Planned |
| `/api/aggregator/providers/{providerId}/settlements` | Provider settlement records | Planned |
| `/api/aggregator/vendors` | Vendor CRUD and relationships | Planned |
| `/api/aggregator/vendors/{vendorId}/pricing` | Vendor pricing | Planned |
| `/api/aggregator/vendors/{vendorId}/settlements` | Vendor settlement | Planned |
| `/api/aggregator/games` | Master game catalog | Planned |
| `/api/aggregator/games/sync` | Provider game sync jobs and diffs | Planned |
| `/api/aggregator/operators` | Operator CRUD and lifecycle | Planned |
| `/api/aggregator/operators/{operatorId}/providers` | Operator provider assignment | Planned |
| `/api/aggregator/operators/{operatorId}/games` | Operator game assignment | Planned |
| `/api/aggregator/operators/{operatorId}/pricing` | Operator sell price | Planned |
| `/api/aggregator/operators/{operatorId}/wallets` | Operator settlement wallet | Planned |
| `/api/aggregator/agents` | Agent CRUD and hierarchy | Planned |
| `/api/aggregator/agents/{agentId}/operators` | Agent operator assignment | Planned |
| `/api/aggregator/agents/{agentId}/commissions` | Agent commission plans and ledger | Planned |
| `/api/aggregator/pricing/buy` | Buy price management, owner-only | Planned |
| `/api/aggregator/pricing/sell` | Sell price management | Planned |
| `/api/aggregator/routing` | Routing rules | Planned |
| `/api/aggregator/routing/simulations` | Route simulation | Planned |
| `/api/routes` | Route CRUD and lookup | Planned |
| `/api/routes/groups` | Route group management | Planned |
| `/api/routes/policies` | Route policy management | Planned |
| `/api/routes/simulations` | Route simulations | Planned |
| `/api/routes/health` | Route health state | Planned |
| `/api/routes/analytics` | Route analytics and performance | Planned |
| `/api/routes/overrides` | Manual and emergency overrides | Planned |
| `/api/routes/fallbacks` | Fallback chain configuration | Planned |
| `/api/aggregator/rtp` | RTP monitoring and alerts | Planned |
| `/api/aggregator/callbacks/provider` | Provider callback ingestion | Planned |
| `/api/aggregator/callbacks/operator` | Operator callback delivery/replay | Planned |
| `/api/aggregator/api-clients` | API keys, scopes, IP allowlists | Planned |
| `/api/aggregator/usage` | API and route usage analytics | Planned |

### 41.3 B2B APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/b2b/white-labels` | White-label CRUD | Planned |
| `/api/b2b/white-labels/{id}/themes` | Theme builder | Planned |
| `/api/b2b/white-labels/{id}/brand-assets` | Logos, favicons, app assets | Planned |
| `/api/b2b/white-labels/{id}/domains` | Domain and SSL configuration | Planned |
| `/api/b2b/white-labels/{id}/menus` | Menu builder | Planned |
| `/api/b2b/white-labels/{id}/pages` | Page/CMS builder | Planned |
| `/api/b2b/white-labels/{id}/homepage` | Homepage builder | Planned |
| `/api/b2b/white-labels/{id}/promotions` | Promotions builder | Planned |
| `/api/b2b/white-labels/{id}/payment-packs` | Payment pack assignment | Planned |
| `/api/b2b/white-labels/{id}/provider-packs` | Provider pack assignment | Planned |
| `/api/b2b/white-labels/{id}/language-packs` | Localization | Planned |
| `/api/b2b/white-labels/{id}/seo` | SEO settings | Planned |
| `/api/b2b/crm/accounts` | Operator CRM accounts | Planned |
| `/api/b2b/crm/contacts` | CRM contacts | Planned |
| `/api/b2b/crm/activities` | CRM activities | Planned |
| `/api/b2b/billing/invoices` | Invoice lifecycle | Planned |
| `/api/b2b/billing/credit-notes` | Credit note lifecycle | Planned |
| `/api/b2b/billing/periods` | Billing periods | Planned |
| `/api/b2b/compliance/reviews` | Compliance reviews | Planned |
| `/api/b2b/kyc/cases` | KYC case queues | Planned |
| `/api/b2b/support/tickets` | Support tickets | Planned |
| `/api/b2b/affiliates` | Affiliate profiles | Planned |
| `/api/b2b/affiliates/{id}/campaigns` | Affiliate campaigns | Planned |
| `/api/b2b/reports` | B2B reporting | Planned |

### 41.4 B2C APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/b2c/players` | Player management | Planned |
| `/api/b2c/players/{playerId}/profile` | Player profile | Planned |
| `/api/b2c/players/{playerId}/status` | Player status updates | Planned |
| `/api/b2c/players/{playerId}/documents` | Player documents | Planned |
| `/api/b2c/wallets` | Wallet lookup and admin actions | Planned |
| `/api/b2c/wallets/{walletId}/ledger` | Ledger entries | Planned |
| `/api/b2c/wallets/{walletId}/adjustments` | Wallet adjustments | Planned |
| `/api/b2c/payments/deposits` | Deposit lifecycle | Planned |
| `/api/b2c/payments/withdrawals` | Withdrawal lifecycle | Planned |
| `/api/b2c/payments/methods` | Payment methods | Planned |
| `/api/b2c/payments/callbacks` | PSP callback ingestion | Planned |
| `/api/b2c/bonuses/templates` | Bonus templates | Planned |
| `/api/b2c/bonuses/instances` | Player bonus instances | Planned |
| `/api/b2c/vip/tiers` | VIP tiers | Planned |
| `/api/b2c/vip/players` | Player VIP state | Planned |
| `/api/b2c/marketing/segments` | Player segments | Planned |
| `/api/b2c/marketing/campaigns` | Campaigns and journeys | Planned |
| `/api/b2c/tournaments` | Tournament management | Planned |
| `/api/b2c/responsible-gaming/limits` | RG limits | Planned |
| `/api/b2c/responsible-gaming/self-exclusions` | Self-exclusion | Planned |
| `/api/b2c/risk/alerts` | Risk and AML alerts | Planned |
| `/api/b2c/support/context` | Player support context | Planned |

### 41.5 Media and AI APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/media/assets` | Asset CRUD and search | Planned |
| `/api/media/assets/{assetId}/versions` | Version management | Planned |
| `/api/media/assets/{assetId}/tags` | Tagging | Planned |
| `/api/media/folders` | Folder hierarchy | Planned |
| `/api/media/collections` | Collections | Planned |
| `/api/media/transformations` | Resize, crop, format, optimization jobs | Planned |
| `/api/media/background-removal` | Background removal jobs | Planned |
| `/api/media/approvals` | Approval workflow | Planned |
| `/api/media/usage` | Usage tracking | Planned |
| `/api/media/analytics` | Delivery and usage analytics | Planned |
| `/api/ai/copilot/conversations` | Copilot conversations | Planned |
| `/api/ai/copilot/messages` | Copilot messages | Planned |
| `/api/ai/generation/media` | AI media generation | Planned |
| `/api/ai/insights` | KPI/risk/ops insights | Planned |
| `/api/ai/usage` | AI usage and cost analytics | Planned |

### 41.6 Enterprise Domain APIs

| Route Group | Purpose | Status |
|-------------|---------|--------|
| `/api/finance/ledger/books` | Ledger books | Planned |
| `/api/finance/ledger/accounts` | Chart of accounts | Planned |
| `/api/finance/ledger/journals` | Journal posting and review | Planned |
| `/api/finance/revenue-recognition` | Revenue recognition rules and events | Planned |
| `/api/finance/fx/rates` | FX rates and sources | Planned |
| `/api/finance/treasury/accounts` | Treasury accounts | Planned |
| `/api/finance/treasury/movements` | Treasury movements and approvals | Planned |
| `/api/finance/statements` | Financial statement generation | Planned |
| `/api/iam/identity-providers` | SSO/OAuth/SAML identity providers | Planned |
| `/api/iam/service-accounts` | Service accounts and machine identities | Planned |
| `/api/iam/api-credentials` | API credentials and key lifecycle | Planned |
| `/api/iam/mfa-policies` | MFA policies | Planned |
| `/api/iam/privileged-access` | Break-glass access requests and sessions | Planned |
| `/api/events` | Event discovery and event queries | Planned |
| `/api/events/schemas` | Event schema registry | Planned |
| `/api/events/subscriptions` | Event subscriptions | Planned |
| `/api/events/dead-letter` | Dead-letter queues | Planned |
| `/api/events/replay` | Event replay jobs | Planned |
| `/api/integration-gateways` | Integration gateway registry | Planned |
| `/api/integration-gateways/adapters` | Gateway adapter management | Planned |
| `/api/integration-gateways/health` | Gateway health | Planned |
| `/api/integration-gateways/dead-letter` | Gateway dead-letter records | Planned |
| `/api/workflows/definitions` | Workflow definitions | Planned |
| `/api/workflows/instances` | Workflow runtime instances | Planned |
| `/api/workflows/tasks` | Human and automated tasks | Planned |
| `/api/workflows/escalations` | Escalations and SLA breaches | Planned |
| `/api/workflows/approvals` | Approval chains and decisions | Planned |
| `/api/configuration/sets` | Configuration sets | Planned |
| `/api/configuration/values` | Scoped configuration values | Planned |
| `/api/configuration/versions` | Configuration version history | Planned |
| `/api/configuration/approvals` | Configuration approvals | Planned |
| `/api/feature-flags` | Feature flag registry | Planned |
| `/api/feature-flags/variants` | Feature variants and targeting | Planned |
| `/api/feature-flags/experiments` | Experiments and A/B tests | Planned |
| `/api/feature-flags/evaluations` | Evaluation logs and rollout diagnostics | Planned |
| `/api/api-management/catalog` | API catalog | Planned |
| `/api/api-management/versions` | API version lifecycle | Planned |
| `/api/api-management/consumers` | API consumers | Planned |
| `/api/api-management/policies` | API policies | Planned |
| `/api/api-management/usage` | API usage analytics | Planned |
| `/api/mdm/providers` | Provider master data | Planned |
| `/api/mdm/operators` | Operator master data | Planned |
| `/api/mdm/players` | Player master data | Planned |
| `/api/mdm/games` | Game master data | Planned |
| `/api/mdm/vendors` | Vendor master data | Planned |
| `/api/mdm/aliases` | Alias mappings | Planned |
| `/api/data-governance/catalog` | Data catalog | Planned |
| `/api/data-governance/lineage` | Data lineage | Planned |
| `/api/data-governance/quality` | Data quality rules and checks | Planned |
| `/api/data-governance/retention` | Retention policies | Planned |
| `/api/data-governance/access` | Dataset access governance | Planned |
| `/api/disaster-recovery/plans` | DR plans | Planned |
| `/api/disaster-recovery/backups` | Backup policies and snapshots | Planned |
| `/api/disaster-recovery/drills` | Restore/failover drills | Planned |
| `/api/disaster-recovery/failovers` | Failover events | Planned |
| `/api/releases` | Release records | Planned |
| `/api/releases/artifacts` | Release artifacts | Planned |
| `/api/releases/approvals` | Release approvals | Planned |
| `/api/releases/rollouts` | Rollout plans and state | Planned |
| `/api/releases/rollbacks` | Rollback plans and execution | Planned |
| `/api/documents` | Document repository and metadata | Planned |
| `/api/documents/{documentId}/versions` | Document version history | Planned |
| `/api/documents/approvals` | Document approval workflows | Planned |
| `/api/documents/legal-holds` | Legal hold records | Planned |
| `/api/documents/e-signatures` | E-signature envelopes and status | Planned |
| `/api/scheduler/jobs` | Scheduled job definitions | Planned |
| `/api/scheduler/runs` | Job run history and status | Planned |
| `/api/scheduler/dependencies` | Job dependencies and sequencing | Planned |
| `/api/scheduler/dead-letter` | Failed job and retry queue | Planned |
| `/api/localization/language-packs` | Language pack management | Planned |
| `/api/localization/translations` | Translation keys and values | Planned |
| `/api/localization/seo` | Localized SEO entries | Planned |
| `/api/licensing/jurisdictions` | Jurisdiction registry | Planned |
| `/api/licensing/licenses` | License records and constraints | Planned |
| `/api/licensing/regulatory-packs` | Regulatory rule packs | Planned |
| `/api/licensing/restrictions` | Country, provider, game, and product restrictions | Planned |
| `/api/cases` | Unified enterprise case records | Planned |
| `/api/cases/evidence` | Case evidence and attachments | Planned |
| `/api/cases/actions` | Case actions, notes, and decisions | Planned |
| `/api/cases/sla` | Case SLA timers and escalations | Planned |
| `/api/reconciliation/runs` | Reconciliation run lifecycle | Planned |
| `/api/reconciliation/sources` | Reconciliation source definitions | Planned |
| `/api/reconciliation/differences` | Reconciliation differences and exceptions | Planned |
| `/api/reconciliation/resolutions` | Resolution actions and approvals | Planned |
| `/api/rules` | Business rule registry | Planned |
| `/api/rules/versions` | Rule version history | Planned |
| `/api/rules/simulations` | Rule simulations and test scenarios | Planned |
| `/api/rules/evaluations` | Rule evaluation logs | Planned |
| `/api/cms/pages` | CMS page management | Planned |
| `/api/cms/blocks` | CMS block library | Planned |
| `/api/cms/promotions` | Promotion content and publishing | Planned |
| `/api/cms/banners` | Banner library and placements | Planned |
| `/api/cms/publishing` | Publish jobs and approvals | Planned |
| `/api/partners` | Partner registry | Planned |
| `/api/partners/lifecycle` | Partner onboarding and lifecycle events | Planned |
| `/api/partners/contracts` | Partner contracts and commercial terms | Planned |
| `/api/partners/api-consumers` | Partner API consumer records | Planned |
| `/api/capacity/plans` | Capacity plans and targets | Planned |
| `/api/capacity/load-tests` | Load test runs and results | Planned |
| `/api/capacity/metrics` | Capacity and performance metrics | Planned |
| `/api/secops/incidents` | Security incidents | Planned |
| `/api/secops/threat-signals` | Threat signals and detections | Planned |
| `/api/secops/vulnerabilities` | Vulnerability findings | Planned |
| `/api/secops/runbooks` | Security runbooks | Planned |
| `/api/business-continuity/plans` | Business continuity plans | Planned |
| `/api/business-continuity/playbooks` | Continuity playbooks | Planned |
| `/api/business-continuity/communications` | Communication plans and messages | Planned |
| `/api/business-continuity/drills` | Continuity drills and outcomes | Planned |
| `/api/kpi-governance/definitions` | KPI catalog definitions | Planned |
| `/api/kpi-governance/thresholds` | KPI thresholds and alerts | Planned |
| `/api/kpi-governance/calculation-rules` | KPI calculation rules | Planned |
| `/api/metadata/catalog` | Metadata catalog entries | Planned |
| `/api/metadata/schema-registry` | Schema registry entries | Planned |
| `/api/metadata/data-dictionary` | Data dictionary entries | Planned |
| `/api/metadata/business-glossary` | Business glossary terms | Planned |
| `/api/integration-platform/registry` | Integration registry entries | Planned |
| `/api/integration-platform/webhooks` | Webhook registry and subscriptions | Planned |
| `/api/integration-platform/transformations` | Transformation mappings | Planned |
| `/api/integration-platform/certifications` | Adapter certification records | Planned |
| `/api/analytics` | Analytics root and discovery | Planned |
| `/api/analytics/providers` | Provider analytics | Planned |
| `/api/analytics/operators` | Operator analytics | Planned |
| `/api/analytics/agents` | Agent analytics | Planned |
| `/api/analytics/players` | Player analytics | Planned |
| `/api/analytics/routes` | Route analytics | Planned |
| `/api/analytics/payments` | Payment analytics | Planned |
| `/api/analytics/compliance` | Compliance analytics | Planned |
| `/api/warehouse` | Warehouse dataset and metadata APIs | Planned |
| `/api/data/pipelines` | ETL/ELT pipeline runs | Planned |
| `/api/data/quality-checks` | Data quality results | Planned |
| `/api/data/metrics` | Governed metric definitions | Planned |
| `/api/kpis` | KPI cube APIs | Planned |
| `/api/dashboards` | Dashboard data APIs | Planned |
| `/api/reports/definitions` | Report definitions | Planned |
| `/api/reports/schedules` | Scheduled reports | Planned |
| `/api/reports/exports` | Report exports | Planned |
| `/api/notifications/templates` | Notification templates | Planned |
| `/api/notifications/deliveries` | Delivery tracking | Planned |
| `/api/notifications/preferences` | Preferences and suppressions | Planned |
| `/api/fraud/rules` | Fraud rules | Planned |
| `/api/fraud/signals` | Fraud signals | Planned |
| `/api/fraud/cases` | Fraud case management | Planned |
| `/api/responsible-gaming/limits` | RG limits | Planned |
| `/api/responsible-gaming/interventions` | RG intervention cases | Planned |
| `/api/observability/incidents` | Incident management | Planned |
| `/api/observability/slo` | SLO definitions and burn-rate views | Planned |
| `/api/devops/deployments` | Deployment records | Planned |
| `/api/devops/backups` | Backup and restore metadata | Planned |
| `/api/tenants` | Tenant management | Planned |
| `/api/tenants/{tenantId}/isolation` | Tenant isolation policy | Planned |
| `/api/sportsbook/providers` | Sports provider management | Planned |
| `/api/sportsbook/events` | Sports events and fixtures | Planned |
| `/api/sportsbook/markets` | Market management | Planned |
| `/api/sportsbook/odds` | Odds feed and odds history | Planned |
| `/api/sportsbook/bets` | Bet slip and bet ticket lifecycle | Planned |
| `/api/sportsbook/settlements` | Sports settlements and resettlements | Planned |
| `/api/sportsbook/cashout` | Cashout offers and acceptance | Planned |
| `/api/mobile/apps` | White-label mobile app config | Planned |
| `/api/mobile/devices` | Mobile devices and push tokens | Planned |
| `/api/search/global` | Global search | Planned |
| `/api/search/saved` | Saved searches | Planned |
| `/api/audit/events` | Audit event explorer | Planned |
| `/api/audit/diffs` | Change diff viewer | Planned |
| `/api/audit/exports` | Compliance audit exports | Planned |
| `/api/audit/integrity-checks` | Tamper detection checks | Planned |

---

## 42. RBAC AND PERMISSION MATRIX

### 42.1 Role Scope Rules

| Role | Scope Rule | Buy Price Visibility | Status |
|------|------------|----------------------|--------|
| Owner Admin | Full platform, all tenants, all domains | Yes | Planned |
| Aggregator Admin | Aggregator operations excluding buy price | No | Planned |
| Finance Admin | Finance, settlement, billing, reconciliation according to assigned scope | Limited by explicit permission | Planned |
| Agent | Assigned operators and assigned commission data only | No | Planned |
| Operator Admin | Own operator and own white-label operation only | No | Planned |
| Affiliate | Own affiliate campaigns, traffic, commissions, and payouts only | No | Planned |
| Support | Read-only support context plus permitted ticket actions | No | Planned |
| Compliance Officer | KYC, AML, RG, evidence, case actions by assigned scope | No | Planned |
| Marketing Manager | Segments, campaigns, templates, promotions by assigned scope | No | Planned |
| Media Manager | Media assets, approvals, transformations by assigned scope | No | Planned |
| Read-Only Auditor | Read-only audit/reporting access by assigned scope | No | Planned |

### 42.2 Permission Matrix

| Capability | Owner Admin | Aggregator Admin | Agent | Operator Admin | Affiliate | Support |
|------------|-------------|------------------|-------|----------------|-----------|---------|
| View buy price | Allow | Deny | Deny | Deny | Deny | Deny |
| Manage buy price | Allow | Deny | Deny | Deny | Deny | Deny |
| View sell price | Allow | Allow | Scoped | Scoped optional | Deny | Deny |
| Manage sell price | Allow | Allow | Deny | Deny | Deny | Deny |
| Manage providers | Allow | Allow | Deny | Deny | Deny | Read-only if needed |
| Manage vendors | Allow | Allow | Deny | Deny | Deny | Deny |
| Manage operators | Allow | Allow | Scoped read | Own operation | Deny | Read-only support |
| Manage agents | Allow | Allow | Deny | Deny | Deny | Deny |
| Manage routing | Allow | Allow | Deny | Deny | Deny | Deny |
| Manage callbacks | Allow | Allow | Deny | Own endpoints only | Deny | Read-only |
| View provider health | Allow | Allow | Scoped | Scoped | Deny | Read-only |
| Manage white labels | Allow | Allow | Deny | Own operation | Deny | Deny |
| Manage players | Allow | Scoped | Deny | Own players | Deny | Read-only support |
| Manage wallets | Allow | Scoped finance | Deny | Own operation with limits | Deny | Read-only |
| Approve withdrawals | Allow | Scoped finance | Deny | Own operation with limits | Deny | Deny |
| Manage bonuses | Allow | Scoped | Deny | Own operation | Deny | Deny |
| Manage affiliates | Allow | Scoped | Deny | Own operation optional | Own data only | Deny |
| Manage support tickets | Allow | Scoped | Deny | Own operation | Deny | Allow |
| Manage KYC/AML | Allow | Scoped compliance | Deny | Own operation with permission | Deny | Read-only support |
| Manage media assets | Allow | Scoped | Deny | Own operation | Deny | Deny |
| Use AI copilot | Allow | Scoped | Scoped | Scoped | Scoped self | Scoped support |
| View audit logs | Allow | Scoped | Deny | Own operation | Deny | Read-only support events |

### 42.3 RBAC Implementation Requirements

- Permissions must be explicit strings, not inferred from role names.
- Role membership must be scoped by tenant/operator/agent/provider where applicable.
- API authorization must evaluate role, permission, scope, and data ownership.
- UI must hide disallowed actions but backend must remain authoritative.
- All permission changes must be audit logged.
- Break-glass access must require reason, expiry, and audit review.

---

## 43. CORE WORKFLOWS

### 43.1 Provider Onboarding

1. Create provider profile.
2. Add contracts and pricing.
3. Configure credentials by environment.
4. Configure callback validation and IP allowlists.
5. Run connectivity tests.
6. Sync game catalog.
7. Review game sync diffs.
8. Configure health checks.
9. Approve provider for operator assignment.
10. Publish provider availability.

### 43.2 Operator Launch

1. Create operator.
2. Assign agent where applicable.
3. Configure operator commercial terms.
4. Assign provider pack and game pack.
5. Configure sell price.
6. Configure API keys and callback endpoints.
7. Configure wallet/settlement account.
8. Configure white label.
9. Run launch checklist.
10. Approve and activate operator.

### 43.3 Game Routing Change

1. Draft route rule.
2. Simulate impact by operator/game/provider/currency.
3. Review margin, RTP, and health impact.
4. Approve route change.
5. Publish route version.
6. Monitor route performance and errors.
7. Roll back if thresholds fail.

### 43.4 Player Deposit

1. Player initiates deposit.
2. PSP route selected.
3. Payment created with idempotency key.
4. PSP callback received and verified.
5. Ledger entries posted.
6. Wallet balance updated.
7. Bonus eligibility evaluated.
8. Notification and audit events emitted.

### 43.5 Withdrawal Approval

1. Player requests withdrawal.
2. Funds placed on hold.
3. Risk, KYC, AML, and RG checks run.
4. Approval workflow starts based on amount and risk.
5. PSP payout initiated.
6. Callback verified.
7. Ledger entries posted.
8. Hold released or reversed.
9. Player notified.

### 43.6 Media Approval

1. Asset uploaded or generated.
2. Metadata, tags, and owner scope assigned.
3. Optimization and Cloudflare Images transforms generated.
4. Usage preview rendered.
5. Approval requested.
6. Approver accepts, rejects, or requests changes.
7. Approved version published.
8. Delivery usage tracked.

---

## 44. INTEGRATION ARCHITECTURE

### 44.1 Integration Categories

| Category | Examples | Status |
|----------|----------|--------|
| Game Providers | Launch, wallet, bets, results, callbacks, catalog sync | Planned |
| Vendors | Contract, pricing, catalog, settlement | Planned |
| PSPs | Deposits, withdrawals, payment methods, callbacks, reconciliation | Planned |
| KYC/AML | Identity verification, document checks, sanctions, PEP, risk scoring | Planned |
| Messaging | Email, SMS, push, in-app, webhooks | Planned |
| Analytics | ClickHouse pipelines, BI exports, dashboard feeds | Planned |
| Accounting | Invoice export, settlement export, tax/accounting integrations | Planned |
| Cloudflare | R2, Images, CDN, Workers AI, logs | Planned |

### 44.2 Integration Rules

- All external callbacks must be signed or otherwise validated.
- All external events must be stored raw before normalization.
- Retry logic must use bounded retries and dead-letter queues.
- Integration credentials must be environment-scoped and rotated.
- Integration health must be observable per endpoint.
- Provider-specific logic must be isolated behind adapter boundaries.

---

## 45. CLOUDFLARE ARCHITECTURE

### 45.1 Cloudflare R2

- Replicate approved media assets from RustFS to R2.
- Store archive copies of original media versions where policy requires.
- Use lifecycle policies for derived assets, logs, and old versions.
- Maintain object metadata mapping between internal asset IDs and R2 keys.
- Support restore workflow from R2 to primary storage.

### 45.2 Cloudflare Images

- Generate delivery variants for provider logos, game images, banners, homepage assets, app icons, and promotion images.
- Store transformation metadata internally.
- Support signed delivery for private or pre-release assets.
- Support fallback transformation path if Cloudflare Images is unavailable.

### 45.3 Cloudflare CDN

- Serve public white-label assets, images, scripts, and static pages.
- Track cache hit rate, bandwidth, status codes, geography, and asset popularity.
- Support purge by asset, white label, domain, and deployment version.

### 45.4 Workers AI

- Support media generation assistance, prompt expansion, tagging suggestions, alt text generation, and operations copilot tasks where approved.
- Store prompts, model metadata, output references, cost, and moderation state.
- Route sensitive business queries through approved internal context and permission checks.

---

## 46. MEDIA CENTER ARCHITECTURE

### 46.1 Media Center Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Provider Logos | Upload, crop, optimize, version, assign to provider/vendor | Planned |
| Game Images | Game thumbnails, lobby images, hero images, localization variants | Planned |
| Banner Library | Promotional banners, responsive variants, campaign mapping | Planned |
| Asset Tagging | Manual tags, AI suggested tags, taxonomy, bulk tagging | Planned |
| AI Generation | Prompt-based image generation and variation workflow | Planned |
| Background Removal | Job queue, preview, manual correction, publish | Planned |
| Image Optimization | Format conversion, compression, responsive sizes, quality presets | Planned |
| Cloudflare Images | Variant management, delivery URLs, signed delivery | Planned |
| Cloudflare R2 | Replication, archive, restore, lifecycle policy | Planned |
| Workers AI | Prompt tools, tagging, alt text, creative assistance | Planned |
| Usage Analytics | Asset usage, delivery count, bandwidth, cache metrics | Planned |
| Version Control | Original, draft, approved, published, rollback | Planned |
| Approval Workflow | Review queues, comments, approvals, rejection reasons | Planned |

### 46.2 Media Governance

- Assets must have owner scope: platform, provider, vendor, operator, white label, campaign, game.
- Published assets must reference approved version only.
- Replacing an asset must create a new version, not overwrite the original.
- AI-generated assets must store prompt, model, seed/settings where available, reviewer, and approval state.
- Asset usage must block deletion when live references exist unless replacement is selected.

---

## 47. AI ARCHITECTURE

### 47.1 AI Capabilities

| Capability | Required Behavior | Status |
|------------|-------------------|--------|
| AI Copilot | Natural language assistant for KPI, risk, ops, media, and support contexts | Planned |
| KPI Insights | Detect GGR, NGR, deposits, withdrawals, provider, route, and operator anomalies | Planned |
| Risk Assistant | Query AML, payment risk, bonus abuse, suspicious activity | Planned |
| Media Generation | Generate banners, backgrounds, game art variants, logos where permitted | Planned |
| Media Metadata | Generate tags, alt text, descriptions, image quality suggestions | Planned |
| Support Assist | Draft responses and summarize player/operator context | Planned |
| Workflow Assist | Explain blocked approvals, settlement mismatches, callback failures | Planned |

### 47.2 AI Safety and Permission Rules

- AI must never bypass RBAC or tenant scope.
- Copilot answers must cite internal records or queries where practical.
- Sensitive financial and player data must be redacted unless user permission allows access.
- AI actions must be approval-gated before mutating production data.
- AI usage, prompts, tool calls, outputs, and costs must be logged.

### 47.3 Example Copilot Queries

- Show operators with declining GGR.
- Which providers are losing money?
- Show pending settlements.
- Show high-risk players.
- Explain why this withdrawal is blocked.
- Which routes have rising error rates?
- Generate banner concepts for this promotion using approved brand assets.

---

## 48. WHITE LABEL ARCHITECTURE

### 48.1 White Label Studio Specification

| Area | Required Capabilities | Status |
|------|-----------------------|--------|
| Theme Builder | Colors, typography, spacing, component styles, dark/light variants | Planned |
| Brand Assets | Logos, favicons, app icons, splash screens, social images | Planned |
| Domains | Domain mapping, SSL status, redirects, canonical domain | Planned |
| Menus | Header, footer, mobile nav, localized labels, visibility rules | Planned |
| Homepage Builder | Sections, game rails, banners, promotions, content blocks | Planned |
| Promotions Builder | Bonus banners, campaign slots, targeting, scheduling | Planned |
| Payment Packs | Payment method availability, ordering, limits, display config | Planned |
| Provider Packs | Provider/game availability, lobby grouping, route constraints | Planned |
| Language Packs | Localized UI text, pages, promotions, SEO metadata | Planned |
| SEO Settings | Metadata, robots rules, sitemap, canonical URLs, open graph | Planned |
| Mobile App Branding | App name, icons, splash, colors, store metadata inputs | Planned |
| Preview and Publish | Draft preview, approvals, publish, rollback | Planned |

### 48.2 White Label Rules

- White label changes must be draftable and previewable.
- Publishing requires approval for production labels.
- White label config must be exportable for review and rollback.
- Domain activation must validate DNS and SSL.
- Provider packs and payment packs must inherit operator compliance restrictions.
- Language packs must support missing-translation reporting.

---

## 49. FINANCE ARCHITECTURE

### 49.1 Finance Domain Scope

The Finance domain is the financial control plane for the aggregator business. It governs ledger structure, treasury, multi-currency operations, revenue recognition, internal transfers, expense controls, financial reporting, and settlement reconciliation.

### 49.2 Finance Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| General Ledger | Double-entry books, journals, posting rules, period close, immutable posted entries | Planned |
| Chart of Accounts | Account hierarchy, account types, tenant/operator mappings, reporting groups | Planned |
| Revenue Recognition | Recognition rules for GGR, NGR, provider fees, operator fees, commissions, adjustments | Planned |
| Multi-Currency Engine | Currency configuration, decimal rules, rounding policy, currency exposure | Planned |
| FX Engine | FX rates, rate sources, effective dates, revaluation, realized/unrealized gain/loss | Planned |
| Treasury Management | Cash positions, bank/PSP balances, liquidity view, payout funding, reserves | Planned |
| Balance Allocation | Cash, bonus, locked, reserve, settlement, operator, provider, agent allocations | Planned |
| Internal Transfers | Transfer requests, approvals, ledger posting, reversal, audit evidence | Planned |
| Expense Management | Provider costs, vendor costs, infrastructure costs, manual expenses, approvals | Planned |
| Profit and Loss | Platform, provider, vendor, operator, agent, game, market, and tenant P&L | Planned |
| Cash Flow | Cash-in, cash-out, treasury movement, PSP balance movement, settlement cash flow | Planned |
| Financial Statements | Trial balance, balance sheet, income statement, cash flow statement | Planned |

### 49.3 Finance Entities

| Entity | Purpose | Status |
|--------|---------|--------|
| LedgerBook | Accounting book by tenant/business unit | Planned |
| LedgerAccount | Account in chart of accounts | Planned |
| LedgerJournal | Journal header | Planned |
| LedgerJournalLine | Debit/credit journal line | Planned |
| AccountingPeriod | Open/close accounting period | Planned |
| RevenueRecognitionRule | Revenue recognition configuration | Planned |
| RevenueRecognitionEvent | Recognized revenue event | Planned |
| Currency | Currency metadata and precision | Planned |
| FxRate | Exchange rate by source and effective time | Planned |
| FxRevaluationRun | Revaluation job | Planned |
| TreasuryAccount | Bank, PSP, crypto, reserve, or internal treasury account | Planned |
| TreasuryMovement | Treasury transfer or balance movement | Planned |
| InternalTransfer | Internal transfer workflow | Planned |
| Expense | Expense record | Planned |
| FinancialStatementRun | Generated statement snapshot | Planned |

### 49.4 Finance Rules

- Posted ledger entries must be immutable.
- Corrections must use reversal and adjustment entries.
- Every financial event must reference source domain, source record, currency, tenant scope, and idempotency key.
- Period close must lock postings unless reopening is approved.
- FX rates must be source-stamped and reproducible.
- Finance reports must reconcile to ledger, settlement, and payment records.

---

## 50. REPORTING ARCHITECTURE

### 50.1 Reporting Domain Scope

The Reporting domain provides governed reports for Aggregator, B2B, B2C, finance, compliance, fraud, operations, media, and executive users.

### 50.2 Aggregator Reports

| Report | Purpose | Status |
|--------|---------|--------|
| Provider P&L | Revenue, cost, margin, fees, settlement exposure by provider | Planned |
| Vendor P&L | Vendor cost, revenue share, settlements, margin | Planned |
| Operator P&L | Operator revenue, costs, bonuses, payment fees, commissions, margin | Planned |
| Agent P&L | Agent assigned operator revenue, commissions, payouts | Planned |
| RTP Reports | Expected vs actual RTP by game/provider/operator/time | Planned |
| Route Reports | Route volume, success, failures, margin, failover usage | Planned |
| Provider Health Reports | Uptime, latency, incidents, SLA score | Planned |
| Callback Reports | Callback errors, replay counts, delivery latency | Planned |

### 50.3 B2B Reports

| Report | Purpose | Status |
|--------|---------|--------|
| CRM Reports | Pipeline, operator lifecycle, activity, renewals | Planned |
| Invoice Reports | Invoice status, aging, collections, adjustments | Planned |
| Contract Reports | Contract terms, renewals, expiries, approval state | Planned |
| Affiliate Reports | Traffic, registrations, FTD, commissions, fraud flags | Planned |
| Support Reports | Ticket volume, SLA, resolution time, category trends | Planned |
| Compliance Reports | Review queue, document status, jurisdiction evidence | Planned |

### 50.4 B2C Reports

| Report | Purpose | Status |
|--------|---------|--------|
| GGR | Gross gaming revenue by operator/game/player cohort | Planned |
| NGR | Net gaming revenue after bonuses, fees, adjustments | Planned |
| Deposits | Deposit volume, acceptance, provider, method, market | Planned |
| Withdrawals | Withdrawal volume, approval, rejection, processing time | Planned |
| Bonus Cost | Bonus issuance, wagering, conversion, abuse cost | Planned |
| VIP | VIP value, tier movement, host performance, rewards | Planned |
| Retention | Cohorts, reactivation, lifecycle stage, campaign impact | Planned |
| Churn | Churn risk, lost players, recovery campaigns | Planned |

### 50.5 Reporting Rules

- Reports must identify source tables, metric definitions, refresh cadence, and access permissions.
- Financial reports must reconcile to ledger and settlement data.
- Reports must support filters by tenant, operator, provider, vendor, agent, currency, jurisdiction, and time range.
- Exports must support CSV, Excel, PDF, scheduled delivery, and audit logging.

---

## 51. NOTIFICATION ARCHITECTURE

### 51.1 Notification Center Scope

The Notification Center handles operational, transactional, marketing, compliance, support, and system notifications across internal users, operators, affiliates, agents, and players.

### 51.2 Channels

| Channel | Required Capabilities | Status |
|---------|-----------------------|--------|
| Email | Templates, SMTP/provider routing, attachments, tracking | Planned |
| SMS | Provider routing, templates, delivery status, opt-out | Planned |
| Telegram | Bot integration, operator/support alerts, delivery status | Planned |
| WhatsApp | Business messaging templates, approval status, delivery status | Planned |
| Push | Web/mobile push, device tokens, topic targeting | Planned |
| In-App | Notification inbox, read/unread, actions, priority | Planned |
| Webhooks | Event subscription, signatures, retries, delivery logs | Planned |

### 51.3 Notification Features

| Feature | Requirement | Status |
|---------|-------------|--------|
| Templates | Versioned templates with localization and channel variants | Planned |
| Variables | Safe variable rendering and validation | Planned |
| Scheduling | Immediate, delayed, recurring, timezone-aware delivery | Planned |
| Retry Logic | Bounded retry, backoff, dead-letter queue | Planned |
| Delivery Tracking | Sent, delivered, failed, opened, clicked, bounced | Planned |
| Preferences | User/player/operator communication preferences | Planned |
| Suppression | Opt-out, quiet hours, compliance suppression | Planned |

### 51.4 Notification Rules

- Transactional and marketing notifications must be separated.
- Compliance and responsible gaming suppressions must override marketing campaigns.
- All external webhook deliveries must be signed and replayable.
- Failed high-priority operational alerts must escalate to alternate channels.

---

## 52. FRAUD AND RISK ARCHITECTURE

### 52.1 Fraud Center Scope

The Fraud Center detects, scores, investigates, and controls fraud patterns across registration, login, payment, bonus, gameplay, affiliate, and operator behavior.

### 52.2 Fraud Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Multi-Account Detection | Shared device, IP, payment method, identity, behavioral correlation | Planned |
| Device Fingerprinting | Device IDs, browser signals, risk fingerprint, history | Planned |
| Velocity Checks | Registration, login, deposit, withdrawal, bonus, bet velocity rules | Planned |
| Payment Abuse | Chargeback risk, card testing, deposit/withdrawal abuse, PSP anomalies | Planned |
| Bonus Abuse | Bonus hunting, wagering abuse, collusion, free spin abuse | Planned |
| Geo Anomalies | Impossible travel, VPN/proxy, jurisdiction mismatch, geofence violations | Planned |
| Behavioral Scoring | Session behavior, bet pattern, payment pattern, lifecycle risk | Planned |
| Rule Engine | Configurable fraud rules, thresholds, actions, simulation | Planned |
| Case Management | Review queues, evidence, notes, actions, escalation | Planned |

### 52.3 Fraud Entities

| Entity | Purpose | Status |
|--------|---------|--------|
| FraudRule | Fraud rule definition | Planned |
| FraudRuleVersion | Versioned rule history | Planned |
| FraudSignal | Atomic fraud signal | Planned |
| FraudScore | Aggregated risk score | Planned |
| FraudCase | Investigation case | Planned |
| DeviceFingerprint | Device identity and risk history | Planned |
| IdentityCluster | Linked accounts and identities | Planned |
| VelocityCounter | Time-windowed velocity counter | Planned |
| FraudAction | Action taken on player/operator/payment | Planned |

### 52.4 Fraud Rules

- Fraud scoring must be explainable.
- Fraud rules must support simulation before activation.
- Fraud actions must be auditable and reversible where business rules allow.
- Fraud Center must integrate with KYC, AML, payments, bonuses, affiliates, and support.

---

## 53. RESPONSIBLE GAMING ARCHITECTURE

### 53.1 RG Domain Scope

The Responsible Gaming domain protects players through limits, exclusions, monitoring, interventions, auditability, and regulatory evidence.

### 53.2 RG Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Self Exclusion | Temporary/permanent exclusions, operator/global scope, evidence | Planned |
| Cooling Off | Time-bound breaks, automatic unlock rules, support visibility | Planned |
| Deposit Limits | Daily, weekly, monthly limits, pending increases, immediate decreases | Planned |
| Loss Limits | Loss thresholds, time windows, enforcement | Planned |
| Wager Limits | Bet/wager thresholds, product/category scope | Planned |
| Session Limits | Time limits, forced logout, warnings | Planned |
| Reality Checks | Periodic player reminders, acknowledgements, configuration | Planned |
| Risk Scoring | Behavioral RG risk score, triggers, trend monitoring | Planned |
| Intervention Workflow | Manual outreach, automated messages, case management, escalation | Planned |

### 53.3 RG Rules

- Limit decreases must apply immediately.
- Limit increases must support cooling-off delays where required.
- Self-exclusion must override login, deposit, bonus, and marketing eligibility.
- RG actions must be visible to support but protected from inappropriate edits.
- RG evidence must be exportable for regulators.

---

## 54. OBSERVABILITY ARCHITECTURE

### 54.1 Observability Scope

Observability provides logs, metrics, traces, alerts, incidents, SLOs, SLAs, and error tracking across application, infrastructure, integrations, workers, media, AI, finance, and data pipelines.

### 54.2 Observability Components

| Component | Role | Status |
|-----------|------|--------|
| Prometheus | Metrics scraping, service metrics, alert rules | Planned |
| Grafana | Dashboards, operational views, SLO dashboards | Planned |
| Loki | Centralized logs and log search | Planned |
| OpenTelemetry | Distributed traces, spans, context propagation | Planned |
| Alertmanager | Alert routing, grouping, suppression, escalation | Planned |
| Error Tracking | Frontend/backend error aggregation and release tracking | Planned |
| Incident Management | Incident lifecycle, severity, ownership, timeline, postmortem | Planned |
| SLO Management | Service objectives, burn rate alerts, error budgets | Planned |
| SLA Reporting | Provider/operator SLA measurements and reports | Planned |

### 54.3 Observability Rules

- Every request must have a request ID.
- Critical workflows must emit business events and trace spans.
- Provider, PSP, callback, worker, and ledger operations must have dedicated dashboards.
- Alerts must include owner, severity, runbook link, and escalation path.
- Incidents must produce postmortem records for severe events.

---

## 55. DEVOPS ARCHITECTURE

### 55.1 DevOps Scope

The DevOps domain defines delivery pipelines, infrastructure automation, secrets, backups, disaster recovery, rollback, and environment governance.

### 55.2 DevOps Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| CI/CD | Build, test, lint, security scan, artifact generation, deployment gates | Planned |
| GitHub Actions | PR checks, migration checks, container builds, release workflows | Planned |
| Deployment Pipelines | Dev/staging/prod promotion, approvals, canary/progressive delivery | Planned |
| Rollback | App rollback, migration rollback plan, config rollback, feature flag rollback | Planned |
| Secrets Management | Central secrets, rotation, environment scoping, audit | Planned |
| Infrastructure as Code | Kubernetes, networking, storage, observability, Cloudflare resources | Planned |
| Backup Strategy | PostgreSQL, Redis, ClickHouse, object storage, config backup | Planned |
| Disaster Recovery | RPO/RTO, restore drills, failover, runbooks | Planned |
| Release Management | Versioning, release notes, deployment calendar, change approvals | Planned |

### 55.3 DevOps Rules

- Production deployments must be reproducible from versioned artifacts.
- Secrets must never be committed.
- Database migrations must be reviewed, tested, and reversible where possible.
- Backup restore must be tested on a schedule.
- Disaster recovery procedures must include owner, RPO, RTO, and verification steps.

---

## 56. MULTI-TENANT ARCHITECTURE

### 56.1 Tenant Types

| Tenant Type | Purpose | Status |
|-------------|---------|--------|
| Platform Tenant | Owns global platform configuration and owner administration | Planned |
| Aggregator Tenant | Manages provider/vendor/operator supply and routing controls | Planned |
| Operator Tenant | Represents operator business operation and scoped data | Planned |
| White Label Tenant | Represents branded player-facing operation/domain | Planned |

### 56.2 Isolation Layers

| Layer | Isolation Requirement | Status |
|-------|-----------------------|--------|
| Database | Tenant/operator scope columns, query guards, optional partitioning | Planned |
| Cache | Tenant-prefixed keys and scoped invalidation | Planned |
| Storage | Tenant/operator/white-label asset namespaces and signed access | Planned |
| Analytics | Scoped warehouse views and row-level filters | Planned |
| Logs | Tenant-aware log fields and restricted access | Planned |
| Search | Scoped indexes and permission filters | Planned |
| API | Tenant resolution, scope enforcement, rate limits | Planned |

### 56.3 Multi-Tenant Rules

- Tenant scope must be resolved before authorization and business logic.
- Cross-tenant access must require explicit permission and audit reason.
- White-label configuration must not leak another operator's providers, payment methods, assets, or players.
- Cache keys, search indexes, warehouse views, logs, and object keys must include scope-safe identifiers.
- Tenant deletion must support legal hold, retention, anonymization, and export requirements.

---

## 57. SPORTSBOOK ARCHITECTURE

### 57.1 Sportsbook Scope

The Sportsbook domain extends the platform beyond casino into sports betting, odds feeds, markets, bet placement, cashout, settlement, trading, live data, and sportsbook risk.

### 57.2 Sportsbook Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Sports Providers | Provider integration, credentials, capabilities, health, contracts | Planned |
| Sports Catalog | Sports, competitions, events, teams, participants, seasons | Planned |
| Markets | Market definitions, selections, status, suspension, mapping | Planned |
| Odds | Pre-match odds, live odds, odds history, odds margin | Planned |
| Bet Slip | Single, multi, system bet validation and pricing | Planned |
| Settlements | Event results, market settlement, resettlement, voids, adjustments | Planned |
| Cashout | Cashout offers, acceptance, recalculation, cancellation | Planned |
| Sportsbook Risk | Exposure limits, liability, suspicious bets, trader alerts | Planned |
| Trading | Manual odds adjustment, market suspension, exposure management | Planned |
| Event Feed | Fixtures, results, scoreboards, feed monitoring | Planned |
| Live Feed | Live events, live odds, latency monitoring, feed failover | Planned |

### 57.3 Sportsbook Rules

- Sportsbook wallet movements must use the same ledger architecture as casino.
- Market settlement and resettlement must be auditable and reversible through ledger entries.
- Odds and bet acceptance must capture exact price, timestamp, provider, and source.
- Live feed latency and provider health must affect market availability.
- Cashout must be permissioned, priced, and auditable.

---

## 58. ADVANCED BONUS ARCHITECTURE

### 58.1 Bonus Engine Scope

The Bonus Engine governs player incentives, wagering requirements, eligibility, abuse detection, cost reporting, and reward settlement across casino, sportsbook, VIP, affiliate, and marketing workflows.

### 58.2 Bonus Types

| Bonus Type | Required Capabilities | Status |
|------------|-----------------------|--------|
| Deposit Bonus | Match percentage, max bonus, minimum deposit, wagering, expiry | Planned |
| Free Spins | Game eligibility, spin count, value, expiry, result handling | Planned |
| Cashback | Loss-based rewards, period calculation, tier rules | Planned |
| Lossback | Loss threshold, return percentage, limits, approval | Planned |
| Referral | Referrer/referee eligibility, conversion triggers, fraud checks | Planned |
| VIP Bonus | Tier-based rewards, manual grants, host approval | Planned |
| Tournament Rewards | Prize pools, rank rewards, settlement, tie rules | Planned |
| Sports Bonus | Free bets, odds boosts, risk-free bet, sportsbook wagering rules | Planned |

### 58.3 Bonus Abuse Detection

| Signal | Purpose | Status |
|--------|---------|--------|
| Repeated Bonus Claims | Detect bonus hunting | Planned |
| Minimum-Risk Wagering | Detect low-risk wagering patterns | Planned |
| Multi-Account Bonus Use | Link identities/devices/payment methods | Planned |
| Payment Cycling | Detect deposit/withdrawal patterns used to farm bonuses | Planned |
| Affiliate Bonus Abuse | Detect poor-quality or collusive traffic | Planned |

### 58.4 Bonus Rules

- Bonus cost must be reported separately from cash revenue.
- Wagering contribution must be configurable by game/category/provider.
- Bonus wallet movements must be ledger-backed.
- Bonus eligibility must check RG, fraud, KYC, jurisdiction, player status, and campaign rules.

---

## 59. MOBILE ARCHITECTURE

### 59.1 Mobile Scope

The Mobile domain supports future iOS and Android white-label applications, including branding, configuration, push notifications, deep links, and app-specific release controls.

### 59.2 Mobile Platform Options

| Option | Requirement | Status |
|--------|-------------|--------|
| React Native | Shared code where practical, native push/deep links, app shell | Planned |
| Flutter | Alternative cross-platform strategy if selected by product/engineering | Planned |
| PWA | Web installability, push where supported, offline-safe shell | Planned |

### 59.3 Mobile Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| White Label Apps | App name, bundle IDs, brand assets, theme, app config | Planned |
| Push Notifications | Device tokens, topics, templates, delivery tracking | Planned |
| Deep Links | Campaign links, game links, payment links, recovery links | Planned |
| Mobile App Config | Feature flags, provider/payment availability, remote config | Planned |
| Mobile Branding | App icons, splash screens, store assets, localized metadata | Planned |
| App Release Management | Build versions, release notes, rollout, rollback | Planned |

### 59.4 Mobile Rules

- Mobile app configuration must inherit white-label and operator restrictions.
- Push notifications must respect marketing, RG, and compliance suppressions.
- Deep links must validate tenant, operator, player state, and jurisdiction.
- Mobile secrets and tokens must be scoped and revocable.

---

## 60. GAME AGGREGATION ENGINE

### 60.1 Aggregation Engine Scope

The Game Aggregation Engine normalizes provider integrations into a consistent platform model for game catalog, launch, wallet, RTP, callbacks, settlement, and operator distribution.

### 60.2 Engine Components

| Component | Required Capabilities | Status |
|-----------|-----------------------|--------|
| Game Mapping | Normalize provider game IDs to platform game records | Planned |
| Provider Mapping | Map provider capabilities, credentials, currencies, jurisdictions | Planned |
| Category Mapping | Normalize categories, tags, volatility, device support | Planned |
| Launch URL Generator | Signed launch URLs, session creation, lobby return, error handling | Planned |
| Wallet Adapter | Seamless wallet, transfer wallet, balance, debit, credit, rollback | Planned |
| RTP Adapter | Provider RTP data, configured RTP, observed RTP, drift events | Planned |
| Callback Adapter | Normalize provider callbacks, signatures, retries, idempotency | Planned |
| Provider Adapter SDK | Shared interface, test harness, mocks, certification checklist | Planned |

### 60.3 Provider Adapter Contract

| Method | Purpose | Status |
|--------|---------|--------|
| `getCapabilities` | Provider capability discovery | Planned |
| `syncGames` | Game catalog sync | Planned |
| `launchGame` | Create game session and launch URL | Planned |
| `getBalance` | Wallet balance lookup where required | Planned |
| `debit` | Reserve/debit player funds | Planned |
| `credit` | Credit winnings/refunds | Planned |
| `rollback` | Reverse failed/voided transaction | Planned |
| `parseCallback` | Normalize callback payload | Planned |
| `healthCheck` | Provider endpoint health | Planned |

### 60.4 Aggregation Rules

- Provider-specific behavior must be isolated in adapters.
- All game transactions must be idempotent.
- Launch, debit, credit, rollback, and callback flows must be traceable end to end.
- Adapter certification must include sandbox tests, failure tests, callback replay, wallet reconciliation, and health monitoring.

---

## 61. ENTERPRISE SEARCH ARCHITECTURE

### 61.1 Search Scope

Enterprise Search provides global and scoped search across modules, entities, audit records, reports, media, tickets, players, operators, providers, games, invoices, settlements, and transactions.

### 61.2 Search Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Global Search | `Ctrl + K`, quick navigation, entity search, actions | Planned |
| Full Text Search | Indexed text across records, notes, tickets, documents metadata | Planned |
| Cross Module Search | Federated search across Aggregator, B2B, B2C, Finance, Media | Planned |
| Saved Searches | User/team saved filters and search queries | Planned |
| Search Suggestions | Recent records, popular actions, typo tolerance | Planned |
| Scoped Indexes | Tenant/operator/role-aware indexing and filtering | Planned |

### 61.3 Search Rules

- Search results must be filtered by RBAC and tenant scope.
- Search indexes must not expose hidden fields such as buy price to unauthorized users.
- Sensitive data must be masked in previews where required.
- Search index updates must be event-driven and replayable.

---

## 62. AUDIT CENTER ARCHITECTURE

### 62.1 Audit Scope

The Audit Center provides immutable visibility into administrative, financial, compliance, security, integration, configuration, and player-impacting changes.

### 62.2 Audit Modules

| Module | Required Capabilities | Status |
|--------|-----------------------|--------|
| Audit Explorer | Search, filters, actor, entity, action, time, scope, severity | Planned |
| Change Diff Viewer | Before/after values, masked sensitive fields, JSON diff | Planned |
| Compliance Exports | Regulator-ready exports by case, entity, period, actor | Planned |
| Retention Policies | Retention by event type, jurisdiction, legal hold | Planned |
| Tamper Detection | Hash chain or equivalent integrity verification | Planned |
| Sensitive Action Review | High-risk actions queue, reason, approval, review outcome | Planned |
| Access Audit | Login, MFA, permission change, break-glass access, API key use | Planned |

### 62.3 Audit Rules

- Critical actions must write audit records synchronously with the mutation.
- Audit records must include actor, scope, source IP/device where available, entity, action, diff, and reason.
- Sensitive field values must be masked but recoverable only through approved security process where legally allowed.
- Audit exports must be permissioned and themselves audit logged.
- Tamper checks must be scheduled and alert on mismatch.

---

## 63. TESTING AND QUALITY BLUEPRINT

| Gate | Requirement | Status |
|------|-------------|--------|
| Unit Tests | Domain logic coverage for pricing, routing, wallet, payments, RBAC, fraud, bonuses, sportsbook, finance | Planned |
| Integration Tests | API, DB, callback, provider adapter, PSP adapter, notification, warehouse pipeline tests | Planned |
| E2E Tests | Provider onboarding, operator launch, deposit, withdrawal, bonus, media approval, white-label publish, sportsbook bet settlement | Planned |
| Contract Tests | Provider, PSP, operator API and webhook contracts | Planned |
| Performance Tests | API load, callback bursts, wallet posting, dashboard queries, media transforms, search, warehouse ingestion | Planned |
| Security Tests | SAST, DAST, dependency scanning, RBAC bypass tests, pentest | Planned |
| Data Quality Tests | Reconciliation, settlement, analytics rollup correctness | Planned |

---

## 64. IMPLEMENTATION PHASES

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 0 | Foundation: monorepo setup, infrastructure repository, Nexa Admin integration, design system, auth and RBAC, database foundation, event bus foundation, Kubernetes foundation, CI/CD foundation, Cloudflare foundation, Media Center foundation | Planned |
| Phase 1 | Core domains: Aggregator, Provider Management, Vendor Management, Games, Operators, Agents | Planned |
| Phase 2 | Aggregator operations: pricing, routing, callbacks, provider health, route simulation, route monitoring, settlement foundations | Planned |
| Phase 3 | Game aggregation engine: adapters, launch, wallet adapter, RTP adapter, callback adapter, certification | Planned |
| Phase 4 | Finance: ledger, chart of accounts, settlements, revenue recognition, FX, treasury, statements, reconciliation | Planned |
| Phase 5 | B2B: white labels, CRM, billing, compliance, support, affiliates, reporting | Planned |
| Phase 6 | B2C: players, wallets, payments, advanced bonuses, VIP, marketing, responsible gaming, fraud and risk | Planned |
| Phase 7 | Data and BI: warehouse, ETL/ELT, KPI cubes, reporting, cohort/revenue/fraud analytics, metadata, data governance | Planned |
| Phase 8 | Media and AI: Media Center, Cloudflare Images/R2, Workers AI, AI copilot, AI analytics | Planned |
| Phase 9 | Sportsbook: providers, catalog, markets, odds, bet slip, cashout, settlements, trading, risk | Planned |
| Phase 10 | Mobile: white-label apps, push, deep links, app config, release management | Planned |
| Phase 11 | Hardening: performance, security operations, disaster recovery, business continuity, incident runbooks, release readiness | Planned |

### 64.1 Immediate Phase 0 Backlog

| Workstream | Required Output | Status |
|------------|-----------------|--------|
| Monorepo Setup | Repository scaffold with apps, services, packages, infrastructure, database, docs, scripts, tests, tools, and GitHub workflows | Planned |
| Infrastructure Repository | Terraform, Kubernetes base overlays, environment overlays, secrets strategy, networking, storage, monitoring foundations | Planned |
| Nexa Admin Integration | Backoffice shell, route map, layout system, navigation, workspace structure, role-aware shell states | Planned |
| Design System | UI tokens, shared components, form patterns, table patterns, modals, empty states, loading states, accessibility baseline | Planned |
| Auth and RBAC | Identity foundation, session model, role model, permission registry, scoped access checks, audit hooks | Planned |
| Database Foundation | Prisma or selected ORM baseline, migration framework, seed strategy, schema conventions, tenant columns, audit columns | Planned |
| Event Bus Foundation | Event contracts, event schema registry, outbox pattern, dead-letter queue, replay strategy, event naming conventions | Planned |
| Kubernetes Foundation | Namespaces, ingress, cert-manager, service templates, health probes, resource limits, environment overlays | Planned |
| CI/CD Foundation | Build, lint, test, security scan, image build, deploy, rollback, environment promotion workflows | Planned |
| Cloudflare Foundation | R2, Images, Workers AI, CDN, DNS, WAF, analytics setup | Planned |
| Media Center Foundation | Asset model, R2 storage mapping, Cloudflare Images pipeline, upload flow, approval flow, transformation queue | Planned |

---

## 65. GOVERNANCE AND CHANGE CONTROL

- Every scope or architecture change must update this document.
- Every update must add a versioned change-log entry.
- The architecture baseline is frozen at v32.0.0 for Phase 0 implementation.
- Architecture expansion must stop unless a material implementation, regulatory, security, or approved strategy gap is discovered.
- Progress percentages must reflect rebuild reality only.
- Legacy completion claims cannot be reintroduced without rebuild validation.
- New entities must identify domain owner, scope model, audit requirements, and API exposure.
- New APIs must identify permission, scope, idempotency, rate limit, and audit behavior.
- New financial workflows must include ledger, reconciliation, approval, and audit behavior.
- New media workflows must include storage, transformation, approval, delivery, and usage behavior.
- New tenant-scoped features must define database, cache, storage, analytics, log, and search isolation.
- New reporting metrics must define source data, calculation logic, refresh cadence, and owner.
- New integrations must define callback validation, retry, dead-letter, health, and observability behavior.

Current baseline:

| Program State | Value |
|---------------|-------|
| Master Architecture Status | Architecture Complete |
| Architecture Baseline | v32.0.0 |
| Architecture Freeze Date | 2026-06-20 |
| Baseline Mode | Greenfield Rebuild |
| Current Execution Stage | Phase 0 - Foundation |
| Active Build Progress | 0% |
| Production Readiness | Not applicable until rebuild completion |

---

## 66. CHANGE LOG

### v32.0.0 - 2026-06-20 | docs(spec): freeze architecture and start Phase 0

| Item | Status |
|------|--------|
| Marked the Master System Architecture as Architecture Complete and frozen for Phase 0 implementation | Completed |
| Added architecture freeze metadata to the document header and Program Status Model | Completed |
| Preserved Greenfield Rebuild state and 0% active build progress while separating architecture completion from build completion | Completed |
| Updated Implementation Phases so Phase 0 becomes the immediate foundation backlog and Phase 1 begins core aggregator domains | Completed |
| Added Phase 0 backlog workstreams for monorepo setup, infrastructure repository, Nexa Admin integration, design system, auth and RBAC, database foundation, event bus foundation, Kubernetes foundation, CI/CD foundation, Cloudflare foundation, and Media Center foundation | Completed |
| Updated governance rules to stop open-ended architecture expansion unless a material implementation, regulatory, security, or approved strategy gap is discovered | Completed |

### v31.0.0 - 2026-06-20 | docs(spec): add enterprise operations and governance domains

| Item | Status |
|------|--------|
| Expanded Enterprise Data Governance Architecture to include data stewardship, PII management, GDPR governance, classification, retention, lineage, quality, and ownership | Completed |
| Added Enterprise Document Management, Scheduling, Feature Flag, Localization, Licensing and Jurisdiction, Case Management, Reconciliation, Business Rules Engine, CMS and Content, Partner Ecosystem, Capacity and Scalability, Security Operations, Business Continuity, Enterprise KPI, Metadata, and Enterprise Integration Platform architectures | Completed |
| Promoted Fraud Architecture to Fraud and Risk Architecture to align AML, device intelligence, velocity checks, bonus abuse, payment abuse, behavioral risk, and case workflows | Completed |
| Expanded Database Architecture with entities for documents, scheduled jobs, feature experiments, jurisdictions, cases, reconciliation, rules, CMS, partners, capacity, SecOps, continuity, KPI governance, metadata, and integration platform management | Completed |
| Expanded API Architecture with route groups for document management, scheduling, feature flags, localization, licensing, cases, reconciliation, rules, CMS, partners, capacity, SecOps, business continuity, KPI governance, metadata, and integration platform operations | Completed |
| Renumbered the Master Architecture and Detailed Implementation Specification sections after the new enterprise chapters | Completed |

### v30.0.0 - 2026-06-20 | docs(spec): add enterprise control-plane architectures

| Item | Status |
|------|--------|
| Added Identity and Access Management Architecture covering authentication, authorization, SSO, OAuth, SAML, MFA, sessions, API auth, service accounts, and privileged access | Completed |
| Added Event-Driven Architecture covering event bus, domain events, integration events, event store, dead-letter queues, replay, outbox, and schema registry | Completed |
| Added Integration Gateway Architecture covering provider, PSP, KYC, messaging, AI, sportsbook, and data gateways | Completed |
| Added Workflow and BPM Architecture covering workflow definitions, engine, approval chains, escalations, SLA timers, task queues, and workflow audit | Completed |
| Added Configuration Architecture covering global, tenant, operator, white-label, provider, feature, risk, and finance configuration | Completed |
| Added API Management Architecture covering developer portal, API catalog, versioning, lifecycle, usage analytics, policy, and webhook management | Completed |
| Added Master Data Management Architecture covering provider, operator, player, game, vendor, currency, and country master data | Completed |
| Added Data Governance Architecture covering ownership, lineage, quality, retention, classification, access governance, and privacy controls | Completed |
| Added Disaster Recovery Architecture covering backups, replication, recovery procedures, RPO, RTO, failover, and restore drills | Completed |
| Added Release Management Architecture covering feature flags, progressive rollout, canaries, rollback, environment promotion, release calendar, and release evidence | Completed |
| Expanded database blueprint with IAM, events, integration gateway, workflow, configuration, API management, MDM, data governance, disaster recovery, and release management entities | Completed |
| Expanded API blueprint with IAM, events, integration gateway, workflow, configuration, API management, MDM, data governance, disaster recovery, and release management route groups | Completed |
| Renumbered detailed implementation sections and table of contents after adding enterprise control-plane chapters | Completed |

### v29.0.0 - 2026-06-20 | docs(spec): promote Data Warehouse and Analytics into the platform intelligence architecture

| Item | Status |
|------|--------|
| Added Data Warehouse and Analytics Architecture as a top-level chapter immediately after Infrastructure Architecture | Completed |
| Defined warehouse purpose as the central analytical platform for Aggregator, B2B, B2C, Finance, Compliance, AI, Fraud, Route Optimization, and Executive Reporting | Completed |
| Added high-level analytics architecture from operational systems through event collection, processing, ClickHouse warehouse, BI, reporting, and AI | Completed |
| Added analytics data domains for Aggregator, B2B, B2C, Finance, Fraud, Route, Media, and AI analytics | Completed |
| Added warehouse layers for raw, normalized, business, and executive data | Completed |
| Added fact and dimension table blueprint including FactBet, FactGameRound, FactWalletTransaction, FactPayment, FactBonus, FactSettlement, FactInvoice, FactCampaign, FactMediaUsage, and core dimensions | Completed |
| Added KPI engine definitions for Aggregator, B2B, and B2C KPIs | Completed |
| Added analytics services including analytics-service, warehouse-service, reporting-service, kpi-service, dashboard-service, and data-pipeline-service | Completed |
| Added ETL/ELT architecture, pipeline requirements, reporting integration, and AI analytics consumption model | Completed |
| Added data governance requirements for catalog, lineage, retention, classification, quality, ownership, and audit tracking | Completed |
| Added analytics API groups including `/api/analytics`, `/api/warehouse`, `/api/reports`, `/api/kpis`, and `/api/dashboards` | Completed |
| Expanded services directory structure and database blueprint to include warehouse and analytics services/entities | Completed |
| Removed the older shallow Data Warehouse Architecture section so section 6 is the single authoritative warehouse architecture | Completed |

### v28.0.0 - 2026-06-20 | docs(spec): add infrastructure directory structure and repository architecture

| Item | Status |
|------|--------|
| Added Infrastructure Directory Structure as a dedicated chapter immediately after Infrastructure Architecture | Completed |
| Defined top-level repository architecture for `apps`, `services`, `packages`, `infrastructure`, `deployments`, `database`, `docs`, `scripts`, `tests`, `tools`, and `.github` | Completed |
| Added Apps directory structure for backoffice, operator portal, agent portal, affiliate portal, player web, mobile app, white-label builder, media center, and AI copilot | Completed |
| Added Services directory structure for gateway, aggregator, provider, vendor, routing, settlement, operator, CRM, billing, compliance, player, wallet, payment, bonus, VIP, affiliate, notification, media, AI, reporting, analytics, and identity services | Completed |
| Added Packages directory structure for UI, design system, auth, permissions, audit, notifications, workflows, SDK, provider adapters, payment adapters, compliance adapters, AI adapters, and shared types | Completed |
| Added Database directory structure for Prisma, migrations, seeds, schemas, views, and ClickHouse | Completed |
| Added Infrastructure, Kubernetes, and Cloudflare directory structures with ownership rules | Completed |
| Added provider adapter and payment adapter directory requirements with common SDK and contract testing rules | Completed |
| Added Media Service and AI Service internal directory structures | Completed |
| Added Tests and Documentation directory structures | Completed |
| Added deployment, scripts, tools, GitHub, and directory ownership rules | Completed |
| Renumbered later sections and table of contents after adding Infrastructure Directory Structure | Completed |

### v27.0.0 - 2026-06-20 | docs(spec): promote routing into top-level Route Architecture domain

| Item | Status |
|------|--------|
| Added Route Architecture as a top-level section immediately after Aggregator PRD | Completed |
| Defined route purpose as the platform-wide connection model for players, operators, games, providers, vendors, wallets, currencies, jurisdictions, APIs, callbacks, payments, and settlements | Completed |
| Added route hierarchy covering platform, vendor, provider, game, operator, route policy, RTP policy, agent, and player scopes | Completed |
| Added route types for game launch, wallet, callback, and payment routes | Completed |
| Added Route Decision Engine factors for commercial, technical, regulatory, business, financial, and risk dimensions | Completed |
| Added route policy model for global, vendor, provider, operator, game, and player policies | Completed |
| Added route groups, priority model, fallback model, monitoring metrics, and simulation activation flow | Completed |
| Added route database entities including RouteGroup, RoutePolicy, RoutePolicyVersion, RouteCondition, RoutePriority, RouteFallback, RouteHealth, RoutePerformance, RouteAssignment, RouteSimulationResult, RouteDecisionLog, and RouteOverride | Completed |
| Added route APIs including `/api/routes`, `/api/routes/groups`, `/api/routes/policies`, `/api/routes/simulations`, `/api/routes/health`, `/api/routes/analytics`, `/api/routes/overrides`, and `/api/routes/fallbacks` | Completed |
| Added Aggregator Route Center dashboard pages for overview, builder, groups, policies, monitoring, analytics, simulations, and incidents | Completed |
| Updated Aggregator workspace navigation to include Route Center | Completed |
| Renumbered later sections and table of contents after adding Route Architecture | Completed |

### v26.0.0 - 2026-06-20 | docs(spec): add system overview and end-to-end platform architecture

| Item | Status |
|------|--------|
| Added System Overview and Architecture section immediately after Program Status | Completed |
| Added executive system overview describing VisioneSoft as an enterprise iGaming ecosystem | Completed |
| Added high-level platform architecture from clients through experience, API gateway, domain services, and data layer | Completed |
| Added business domain architecture tree covering Aggregator, B2B, B2C, Sportsbook, Media, AI, Data Warehouse, Finance, Notifications, Fraud, and Audit | Completed |
| Added end-to-end player game request flow from white label through wallet, routing, provider, callback, ledger, reporting, warehouse, and audit | Completed |
| Added deployment architecture from Internet through Cloudflare, Kubernetes, API Gateway, services, workers, databases, and storage | Completed |
| Added data flow architecture for provider supply, payments/wallet/ledger/reporting, media delivery, and analytics pipelines | Completed |
| Added system context diagram for external actors and platform outputs | Completed |
| Added core architectural principles including API First, Multi-Tenant, Cloud Native, Event Driven, Zero Trust, Auditability, Compliance by Design, AI Assisted Operations, and Financial Correctness | Completed |
| Renumbered architecture sections and table of contents after inserting the new system overview chapter | Completed |

### v25.0.0 - 2026-06-20 | docs(spec): add missing enterprise domains for finance, data, reporting, sportsbook, DevOps, and governance

| Item | Status |
|------|--------|
| Added Finance Architecture with GL, chart of accounts, revenue recognition, FX, treasury, P&L, cash flow, and statements | Completed |
| Added Data Warehouse Architecture with data lake, ETL/ELT, ClickHouse warehouse, KPI cubes, snapshots, cohorts, revenue and fraud analytics | Completed |
| Added Reporting Architecture for Aggregator, B2B, and B2C reports | Completed |
| Added Notification Architecture with email, SMS, Telegram, WhatsApp, push, in-app, and webhooks | Completed |
| Added Fraud Center with multi-account, device fingerprinting, velocity, payment abuse, bonus abuse, geo anomalies, behavioral scoring, and rule engine | Completed |
| Expanded Responsible Gaming Architecture with limits, reality checks, risk scoring, and intervention workflows | Completed |
| Added Observability Architecture with Prometheus, Grafana, Loki, OpenTelemetry, Alertmanager, incidents, SLO, SLA, and error tracking | Completed |
| Added DevOps Architecture with CI/CD, GitHub Actions, rollback, secrets, IaC, backups, and disaster recovery | Completed |
| Added Multi-Tenant Architecture with platform, aggregator, operator, and white-label tenants plus isolation rules | Completed |
| Added Sportsbook Architecture with providers, markets, odds, bet slip, settlement, cashout, risk, trading, and live feeds | Completed |
| Added Advanced Bonus Architecture with bonus types and abuse detection | Completed |
| Added Mobile Architecture for iOS, Android, white-label apps, push, deep links, and app config | Completed |
| Added Game Aggregation Engine with mapping, launch URL, wallet adapter, RTP adapter, callback adapter, and provider adapter SDK | Completed |
| Added Enterprise Search Architecture with global, full-text, cross-module, saved, and scoped search | Completed |
| Added Audit Center Architecture with explorer, diff viewer, compliance exports, retention, tamper detection, and sensitive action review | Completed |
| Added enterprise domain database additions for finance, warehouse, reporting, notifications, fraud, RG, observability, DevOps, tenancy, sportsbook, mobile, search, and audit | Completed |
| Added enterprise domain API route groups for finance, data, reports, notifications, fraud, RG, observability, DevOps, tenants, sportsbook, mobile, search, and audit | Completed |

### v24.0.0 - 2026-06-20 | docs(spec): split into master architecture and detailed implementation specification

| Item | Status |
|------|--------|
| Converted document into Volume 1 and Volume 2 structure | Completed |
| Preserved greenfield rebuild mode and 0% active build progress | Completed |
| Removed production-ready status from the active status model | Completed |
| Expanded Aggregator, B2B, and B2C PRD sections | Completed |
| Added detailed Aggregator/B2B/B2C database entity blueprint | Completed |
| Added detailed API route blueprint for Aggregator, B2B, B2C, Media, and AI | Completed |
| Added RBAC and permission matrix with buy price restrictions | Completed |
| Expanded White Label Studio specification | Completed |
| Expanded Media Center specification | Completed |
| Added Cloudflare R2, Cloudflare Images, CDN, and Workers AI architecture details | Completed |

### v33.0.0 — 2026-06-21 | feat(platform): complete Phase 0 foundation + Phase 1 service implementation

| Item | Status | Completion |
|------|--------|------------|
| packages/design-system — color tokens, typography, spacing, shadows, CSS variable generator | Completed | 100% |
| packages/ui — React components: Button, Badge, Input, Select, Card, KpiCard, Table, Modal, Alert, Spinner, EmptyState, Pagination, StatusBadge | Completed | 100% |
| packages/notifications — NotificationTemplate, NotificationDelivery, Suppression, Preference, SendRequest, renderTemplate, isChannelSuppressed | Completed | 100% |
| packages/provider-adapters — ProviderAdapter interface, MockProviderAdapter, ProviderAdapterRegistry, all wallet/callback/health types | Completed | 100% |
| packages/payment-adapters — PaymentAdapter interface, MockPaymentAdapter, PaymentAdapterRegistry, all deposit/withdrawal/callback types | Completed | 100% |
| packages/compliance-adapters — ComplianceAdapter interface, MockComplianceAdapter, KYC/AML/sanctions check types | Completed | 100% |
| packages/ai-adapters — AiAdapter interface, MockAiAdapter, AiAdapterRouter, completion/image/embedding types | Completed | 100% |
| services/identity-service — Full JWT auth (HMAC-SHA256), PBKDF2-600k password hashing (Web Crypto), SessionStore, IdentityService, validateBearerToken | Completed | 100% |
| services/player-service — PlayerRepository with full CRUD, idempotent mutations, audit+outbox, search/list, documents, notes | Completed | 100% |
| services/wallet-service — WalletRepository, double-entry ledger, string-based decimal arithmetic, holds, idempotent transactions | Completed | 100% |
| services/payment-service — PaymentService, deposit/withdrawal workflows, PSP adapter integration, withdrawal approval, callback processing | Completed | 100% |
| services/bonus-service — BonusService, templates, instances, wagering contribution engine, expiry tracking | Completed | 100% |
| services/vip-service — VipService, tier management, points awarding, lifetime points, tier change events | Completed | 100% |
| services/compliance-service — ComplianceService, KYC case management, RG limits, self-exclusion, AML alerts | Completed | 100% |
| services/crm-service — CrmService, accounts, contacts, activities, pipeline opportunities | Completed | 100% |
| services/billing-service — BillingService, invoices, credit notes, lifecycle transitions, approval workflow | Completed | 100% |
| services/affiliate-service — AffiliateService, campaigns, tracking links, conversion tracking, commission recording | Completed | 100% |
| services/notification-service — NotificationService, template resolution, channel delivery, suppression, preferences, mock providers | Completed | 100% |
| services/media-service — MediaService, asset registration, approval workflow, transformations, Cloudflare R2 references | Completed | 100% |
| services/ai-service — AiService, conversations, message history, system prompts per context, usage tracking | Completed | 100% |
| services/analytics-service — AnalyticsService, data source interface, platform summary, provider/operator/player/route/payment analytics | Completed | 100% |
| services/reporting-service — ReportingService, 5-report catalog, export request lifecycle | Completed | 100% |
| services/kpi-service — KpiService, 8-KPI catalog (GGR, NGR, ARPU, Margin, Route Success, Deposits, Churn, Bonus Cost), computation interface | Completed | 100% |
| services/dashboard-service — DashboardService, 8 dashboard layouts (aggregator, provider, operator, b2c, finance, media, AI, compliance), widget system | Completed | 100% |
| services/data-pipeline-service — DataPipelineService, pipeline definitions, run tracking, quality checks, 8 default pipelines | Completed | 100% |
| services/warehouse-service — WarehouseService, 18 ClickHouse table definitions (raw/normalized/business/executive), DDL generator | Completed | 100% |
| services/provider-service — ProviderService, credentials, health checks, game sync diffs, incident management | Completed | 100% |
| services/settlement-service — SettlementService, provider/vendor/operator/agent/affiliate cycles, approval, processing, adjustments | Completed | 100% |
| apps/backoffice — Complete React SPA with BrowserRouter, 18 pages, AuthContext (JWT-based), AppShell with full navigation, LoginPage, Dashboard with KPIs+alerts+build status, Providers/Vendors/Games/Operators/Agents/Routes pages, Players/Payments/Bonuses pages, WhiteLabels/CRM/Invoices pages, MediaCenter, AI Copilot chat, Reports catalog+export modal, Audit log, Settings (General/RBAC/Flags/Integrations/System) | Completed | 100% |
| database/prisma/schema.prisma — Expanded from 22 to 55+ models: added Player, PlayerDocument, PlayerNote, Wallet, WalletLedgerEntry, WalletTransaction, WalletHold, Payment, WithdrawalApproval, BonusTemplate, BonusInstance, BonusLedger, WhiteLabel, Invoice, CrmAccount, CrmContact, CrmActivity, CrmOpportunity, KycCase, KycDocument, ResponsibleGamingLimit, SelfExclusion, AmlAlert, Affiliate, AffiliateCampaign, AffiliateTrackingLink, SettlementCycle, SettlementAdjustment, VipTier, PlayerVipStatus | Completed | 100% |
| infrastructure/kubernetes/services/api-gateway.yaml — Deployment, Service, HPA | Completed | 100% |
| infrastructure/kubernetes/ingress/main-ingress.yaml — TLS ingress for api.visionesoft.com + admin.visionesoft.com | Completed | 100% |
| infrastructure/kubernetes/postgres/postgres.yaml — StatefulSet + Service | Completed | 100% |
| .github/workflows/ci.yml — 3-job CI: build+typecheck, schema validation, security audit | Completed | 100% |
| tsconfig.base.json — Set exactOptionalPropertyTypes to false for practical DB record construction | Completed | 100% |

