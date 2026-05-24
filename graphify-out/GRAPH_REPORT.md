# Graph Report - .  (2026-05-24)

## Corpus Check
- 22 files · ~413,968 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 106 nodes · 126 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_CRUD UI & Modals|CRUD UI & Modals]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_CICD & Deployment|CI/CD & Deployment]]
- [[_COMMUNITY_Visual Assets (Nina, Stig, Header)|Visual Assets (Nina, Stig, Header)]]
- [[_COMMUNITY_Candy Crush Map Rendering|Candy Crush Map Rendering]]
- [[_COMMUNITY_Dev Tooling|Dev Tooling]]
- [[_COMMUNITY_Claude Config|Claude Config]]
- [[_COMMUNITY_Vite Environment Types|Vite Environment Types]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 13 edges
2. `Badekartet - Norwegian Bathroom Renovation Tracker App` - 11 edges
3. `index.html - App Entry Point` - 7 edges
4. `GitHub Actions Deploy Workflow` - 6 edges
5. `Badekartet App Header Logo` - 5 edges
6. `scripts` - 4 edges
7. `Task` - 4 edges
8. `ShopItem` - 4 edges
9. `MapItem` - 4 edges
10. `Stig - Cartoon Character Game Piece` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Stig Character Image (public/)` --static_asset_of--> `Badekartet - Norwegian Bathroom Renovation Tracker App`  [INFERRED]
  public/stig.png → index.html
- `Nina Character Image (public/)` --static_asset_of--> `Badekartet - Norwegian Bathroom Renovation Tracker App`  [INFERRED]
  public/nina.png → index.html
- `Badekartet Header Logo (public/)` --static_asset_of--> `Badekartet - Norwegian Bathroom Renovation Tracker App`  [INFERRED]
  public/header.png → index.html
- `Badekartet App Header Logo` --is_header_logo_of--> `Badekartet - Norwegian Bathroom Renovation Tracker App`  [INFERRED]
  header.png → index.html
- `Candy Crush-style Progress Map UI Pattern` --ui_pattern_of--> `Badekartet - Norwegian Bathroom Renovation Tracker App`  [INFERRED]
  header.png → index.html

## Communities (11 total, 2 thin omitted)

### Community 0 - "CRUD UI & Modals"
Cohesion: 0.13
Nodes (10): ModalMode, Props, Modal, Props, supabase, DEFAULT_SHOP, DEFAULT_TASKS, Assignee (+2 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+6 more)

### Community 2 - "Runtime Dependencies"
Cohesion: 0.14
Nodes (13): dependencies, canvas-confetti, react, react-dom, @supabase/supabase-js, name, private, scripts (+5 more)

### Community 3 - "CI/CD & Deployment"
Cohesion: 0.17
Nodes (13): GitHub Pages Deployment Target, Node.js 20 Build Environment, VITE_SUPABASE_ANON_KEY Secret, Supabase Backend Integration, VITE_SUPABASE_URL Secret, GitHub Actions Deploy Workflow, Font Awesome 6.5 Icons (CDN), Baloo 2 Font (Google Fonts) (+5 more)

### Community 4 - "Visual Assets (Nina, Stig, Header)"
Cohesion: 0.24
Nodes (13): Header Description: colorful Candy Crush-style banner with the title 'BADEKARTET' in bold bubble letters and subtitle 'Nina og Stigs vei mot nytt bad!' (Nina and Stig's road to a new bathroom!); surrounded by bathroom-themed icons (rubber duck, showerhead, tiles, cleaning products, bubbles) on a winding road motif, Badekartet App Header Logo, Nina Character Description: cheerful cartoon girl/young woman with brown hair in a ponytail and round glasses, wearing denim overalls and a white shirt, holding a red screwdriver and pointing; 3D illustrated style used as a game piece on the progress map, Nina - Cartoon Character Game Piece, Stig Character Description: cheerful cartoon man with grey hair and glasses, wearing a light blue shirt and jeans, holding a yellow paint roller and waving; 3D illustrated style used as a game piece on the progress map, Stig - Cartoon Character Game Piece, Badekartet - Norwegian Bathroom Renovation Tracker App, Candy Crush-style Progress Map UI Pattern (+5 more)

### Community 5 - "Candy Crush Map Rendering"
Cohesion: 0.19
Nodes (9): DynamicMap(), getPos(), Props, STOP_ICONS, LEVEL_TITLES, levelTitle(), MapPage(), Props (+1 more)

### Community 6 - "Dev Tooling"
Cohesion: 0.29
Nodes (7): devDependencies, @types/canvas-confetti, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

## Knowledge Gaps
- **50 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Badekartet - Norwegian Bathroom Renovation Tracker App` connect `Visual Assets (Nina, Stig, Header)` to `CI/CD & Deployment`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `index.html - App Entry Point` connect `CI/CD & Deployment` to `Visual Assets (Nina, Stig, Header)`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling` to `Runtime Dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `Badekartet - Norwegian Bathroom Renovation Tracker App` (e.g. with `Supabase Backend Integration` and `Badekartet App Header Logo`) actually correct?**
  _`Badekartet - Norwegian Bathroom Renovation Tracker App` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CRUD UI & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._