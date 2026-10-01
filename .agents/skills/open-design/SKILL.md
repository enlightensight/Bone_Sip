---
name: open-design
description: Work with OpenDesign (nexu-io/open-design) to build UI prototypes, live dashboards, slide decks, mobile interfaces, HyperFrames motion graphics, and DESIGN.md design systems.
---

# OpenDesign Integration Guide

OpenDesign (`nexu-io/open-design`) turns coding agents into local-first design engines capable of generating brand-consistent prototypes, dashboards, presentations, and motion graphics.

## Core Capabilities

- **Design Systems (`DESIGN.md`)**: Define colors, typography, spacing, component rules, and brand contracts.
- **Prototypes (Web/Desktop/Mobile)**: Standalone HTML/CSS/JS artifacts rendered in sandboxed iframes.
- **Live Dashboards & Decision Rooms**: KPI walls and interactive decision rooms with parameter tweak panels.
- **Decks & Presentations**: Multi-slide decks with speaker notes and export to HTML, PDF, and PPTX.
- **HyperFrames Motion Graphics**: Code-driven animations with GSAP and HTML/CSS rendered to MP4.
- **MCP Server**: Two-way bridge exposing OpenDesign templates, skills, and daemon tools to Antigravity.

---

## MCP Server Setup & Commands

### 1. Auto-Installation via CLI
If you have the `od` CLI installed:
```bash
od mcp install antigravity
```

To preview changes before applying:
```bash
od mcp install antigravity --print
```

### 2. Manual Workspace MCP Configuration
Located at [.agents/mcp_config.json](file:///c:/projects/BONE_SIP/.agents/mcp_config.json):
```json
{
  "mcpServers": {
    "open-design": {
      "command": "od",
      "args": ["mcp", "--daemon-url", "od://app"]
    }
  }
}
```

### 3. OpenDesign Daemon Lifecycle
Start the OpenDesign local daemon in the background:
```bash
# In your open-design repository clone:
pnpm tools-dev
# Or run headless daemon:
od --no-open
```
The daemon runs locally (typically on `http://127.0.0.1:17456` or via local socket).
