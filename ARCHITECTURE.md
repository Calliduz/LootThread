# LootThread Architecture

This document describes the high-level architecture of the LootThread digital marketplace.

## Multi-Repo Strategy

LootThread follows a decoupled architecture split into two primary repositories:

1.  **Frontend (`LootThread`)**: A modern React application powered by Vite, Tailwind CSS, and TanStack Query.
2.  **Backend (`lootthread-server`)**: A Node.js/Express server with Mongoose for MongoDB persistence.

---

## 🎨 Frontend Architecture

The frontend is organized to separate UI from data orchestration:

### 1. Data Orchestration (TanStack Query)
- **Hooks (`src/hooks/useApi.ts`)**: Encapsulates all server-state logic. No component performs direct API calls.
- **Cache Management**: Uses strategic cache invalidation (e.g., refreshing dashboard stats after a successful purchase or product upload).

### 2. API Layer
- **Axios Instance (`src/api/axiosInstance.ts`)**: Centralized HTTP client configured with baseURL and JWT interceptors.
- **Endpoints (`src/api/endpoints.ts`)**: Pure Axios function calls grouped by domain (Products, Artists, Orders).

### 3. Component Hierarchy
- **Views**: Main page entry points.
- **Components**: Reusable UI elements (Modals, Cards, etc.) that consume custom hooks for data.

---

## ⚡ Backend Architecture (MVC)

The server follows a classic Model-View-Controller pattern (minus the View, as it is a headless API):

-   **Models (`src/models/`)**: Mongoose schemas defining our tactical data structures (Artists, Products, Orders).
-   **Controllers (`src/controllers/`)**: Logic layer handling requests, validation, and database interaction.
-   **Routes (`src/routes/`)**: Maps API endpoints to controller methods.
-   **Middleware (`src/middleware/`)**: Handles authentication (JWT) and request validation.

---

## 🔐 Authentication Flow

1.  **Login**: Artist submits credentials via `useLogin`.
2.  **JWT**: Backend verifies and returns a signed JWT.
3.  **Persistence**: JWT is stored in `localStorage`.
4.  **Injection**: The `axiosInstance` interceptor automatically attaches the `Authorization: Bearer <token>` header to every outgoing request.

---

## 🔄 Data Synchronization

LootThread leverages TanStack Query for efficient synchronization:

-   **Stale-While-Revalidate**: UI displays cached data while fetching updates in the background.
-   **Parallel Queries**: The `ArtistDashboard` fetches stats and analytics concurrently for maximum performance.
-   **Mutations**: Write operations (Checkout, Upload) automatically trigger invalidations to keep the global state consistent.
