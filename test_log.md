# KM Nav Test Log

## 1. Unit Tests (Jest)

| ID  | Req  | Description                          | Input                  | Expected                                  | Actual | Result | Bug# |
|-----|------|--------------------------------------|------------------------|-------------------------------------------|--------|--------|------|
| U01 | FR-4 | Adjacent nodes shortest path         | A→B                    | path=[A,B], distance=10                   |        |        |      |
| U02 | FR-4 | Multi-hop shortest path              | A→C                    | path=[A,B,C], distance=20                 |        |        |      |
| U03 | FR-4 | Start equals goal (edge case)        | A→A                    | path=[A], distance=0                      |        |        |      |
| U04 | FR-9 | Cross-floor shortest path            | A→D                    | distance=24, path contains E1, E2         |        |        |      |
| U05 | -    | Unreachable node (edge case)         | A→X (X isolated)       | returns null                              |        |        |      |
| U06 | FR-4 | dijkstraAllDistances correctness     | start=A                | dist: A=0, B=10, C=20, D=24               |        |        |      |
| U07 | FR-4 | reconstructPath success              | start=A, goal=C        | [A, B, C]                                 |        |        |      |
| U08 | -    | reconstructPath unreachable          | start=A, goal=X        | returns null                              |        |        |      |

## 2. Integration Tests (Postman)

| ID  | Req  | Endpoint                              | Input                          | Expected         | Actual | Result | Bug# |
|-----|------|---------------------------------------|--------------------------------|------------------|--------|--------|------|
| I01 | FR-8 | POST /api/auth/register (success)     | unique username                | 200 + JWT        |        |        |      |
| I02 | FR-8 | POST /api/auth/register (duplicate)   | existing username              | 409              |        |        |      |
| I03 | FR-8 | POST /api/auth/login (success)        | valid credentials              | 200 + JWT        |        |        |      |
| I04 | FR-8 | POST /api/auth/login (wrong pwd)      | wrong password                 | 401              |        |        |      |
| I05 | FR-8 | GET /api/history (no token)           | no Authorization header        | 401              |        |        |      |
| I06 | FR-8 | GET /api/history (with token)         | valid JWT                      | 200 + list       |        |        |      |
| I07 | FR-4 | POST /api/route (single floor)        | F1 R101 → F1 R136              | path returned    |        |        |      |
| I08 | FR-9 | POST /api/route (cross + stairs)      | F1→F3, prefer-stairs           | path uses stairs |        |        |      |
| I09 | FR-9 | POST /api/route (cross + elevator)    | F1→F3, prefer-elevator         | path uses elev.  |        |        |      |
| I10 | FR-4 | POST /api/route (start=end)           | R101 → R101                    | empty / single   |        |        |      |
| I11 | FR-3 | GET /api/search?q=r10                 | partial match                  | R101–R109        |        |        |      |
| I12 | FR-3 | GET /api/search?q=R999                | non-existent                   | empty result     |        |        |      |

## 3. System Tests (Browser Manual)

| ID  | Req       | Scenario                       | Steps                                            | Expected                   | Actual | Result | Bug# |
|-----|-----------|--------------------------------|--------------------------------------------------|----------------------------|--------|--------|------|
| S01 | FR-1,4,8  | New user first-time flow       | Register → Login → Search → Route → Directions   | All steps complete         |        |        |      |
| S02 | FR-9,6    | Cross-floor + stairs preference| Login → F1 R101 → F3 R325 → Stairs              | Path uses stairs only      |        |        |      |
| S03 | FR-9,6    | Cross-floor + elevator         | Same as S02 but Elevator                         | Path uses elevator         |        |        |      |
| S04 | FR-8      | History view + Repeat          | Login → 3 routes → History → Repeat             | Start/end pre-filled       |        |        |      |
| S05 | FR-8      | Unauthorized access            | Without login → navigate to /history             | Redirect to /login         |        |        |      |
| S06 | FR-5,3    | UI: directions panel toggle    | Generate route → collapse → expand → close      | Panel responds correctly   |        |        |      |

## 4. Bugs Found

### Bug-1
- **Found in**: (test ID, e.g., U03)
- **Trigger**:
- **Symptom**:
- **Root cause**:
- **Fix**:
- **Status**: Fixed / Pending
- **Verified by**: (test ID)

### Bug-2
- **Found in**:
- **Trigger**:
- **Symptom**:
- **Root cause**:
- **Fix**:
- **Status**:
- **Verified by**:

## 5. Performance Data (optional)

| Operation              | Avg (ms) | Min | Max | Sample size |
|------------------------|----------|-----|-----|-------------|
| Single-floor route     |          |     |     |             |
| Cross-floor route (3F) |          |     |     |             |
| Search query           |          |     |     |             |

## 6. Limitations Identified

-
-
-
