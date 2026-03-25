import fs from "node:fs";
import path from "node:path";
import { DEFAULT_IDENTITY_FILENAME } from "./workspace.js";
import { resolveOpenClawPackageRootSync } from "../infra/openclaw-root.js";

/**
 * Get the Git-tracked project root directory.
 * This is where IDENTITY.md survives OS reinstalls.
 */
function getProjectRoot(): string | null {
  return resolveOpenClawPackageRootSync({ cwd: process.cwd() });
}

export type AgentIdentityFile = {
  name?: string;
  emoji?: string;
  theme?: string;
  creature?: string;
  vibe?: string;
  avatar?: string;
};

const IDENTITY_PLACEHOLDER_VALUES = new Set([
  "pick something you like",
  "ai? robot? familiar? ghost in the machine? something weirder?",
  "how do you come across? sharp? warm? chaotic? calm?",
  "your signature - pick one that feels right",
  "workspace-relative path, http(s) url, or data uri",
]);

function normalizeIdentityValue(value: string): string {
  let normalized = value.trim();
  normalized = normalized.replace(/^[*_]+|[*_]+$/g, "").trim();
  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    normalized = normalized.slice(1, -1).trim();
  }
  normalized = normalized.replace(/[\u2013\u2014]/g, "-");
  normalized = normalized.replace(/\s+/g, " ").toLowerCase();
  return normalized;
}

function isIdentityPlaceholder(value: string): boolean {
  const normalized = normalizeIdentityValue(value);
  return IDENTITY_PLACEHOLDER_VALUES.has(normalized);
}

export function parseIdentityMarkdown(content: string): AgentIdentityFile {
  const identity: AgentIdentityFile = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const cleaned = line.trim().replace(/^\s*-\s*/, "");
    const colonIndex = cleaned.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const label = cleaned.slice(0, colonIndex).replace(/[*_]/g, "").trim().toLowerCase();
    const value = cleaned
      .slice(colonIndex + 1)
      .replace(/^[*_]+|[*_]+$/g, "")
      .trim();
    if (!value) {
      continue;
    }
    if (isIdentityPlaceholder(value)) {
      continue;
    }
    if (label === "name") {
      identity.name = value;
    }
    if (label === "emoji") {
      identity.emoji = value;
    }
    if (label === "creature") {
      identity.creature = value;
    }
    if (label === "vibe") {
      identity.vibe = value;
    }
    if (label === "theme") {
      identity.theme = value;
    }
    if (label === "avatar") {
      identity.avatar = value;
    }
  }
  return identity;
}

export function identityHasValues(identity: AgentIdentityFile): boolean {
  return Boolean(
    identity.name ||
    identity.emoji ||
    identity.theme ||
    identity.creature ||
    identity.vibe ||
    identity.avatar,
  );
}

export function loadIdentityFromFile(identityPath: string): AgentIdentityFile | null {
  try {
    const content = fs.readFileSync(identityPath, "utf-8");
    const parsed = parseIdentityMarkdown(content);
    if (!identityHasValues(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Load agent identity with priority:
 * 1. Git-tracked project root (survives OS reinstalls)
 * 2. Agent directory (runtime persistent storage)
 * 3. Workspace (legacy fallback)
 * @param agentDir - Agent's runtime directory
 * @param workspace - Workspace directory (fallback)
 */
export function loadAgentIdentity(agentDir: string, workspace?: string): AgentIdentityFile | null {
  // Priority 1: Git-tracked project root (survives OS reinstalls)
  const projectRoot = getProjectRoot();
  if (projectRoot) {
    const projectIdentityPath = path.join(projectRoot, DEFAULT_IDENTITY_FILENAME);
    const projectIdentity = loadIdentityFromFile(projectIdentityPath);
    if (projectIdentity) {
      return projectIdentity;
    }
  }
  
  // Priority 2: Agent directory (runtime persistent storage)
  const agentIdentityPath = path.join(agentDir, DEFAULT_IDENTITY_FILENAME);
  const agentIdentity = loadIdentityFromFile(agentIdentityPath);
  if (agentIdentity) {
    return agentIdentity;
  }
  
  // Priority 3: Workspace (legacy fallback)
  if (workspace) {
    const workspaceIdentityPath = path.join(workspace, DEFAULT_IDENTITY_FILENAME);
    return loadIdentityFromFile(workspaceIdentityPath);
  }
  
  return null;
}

/**
 * @deprecated Use loadAgentIdentity(agentDir, workspace) instead.
 * Legacy function for backward compatibility.
 */
export function loadAgentIdentityFromWorkspace(workspace: string): AgentIdentityFile | null {
  const identityPath = path.join(workspace, DEFAULT_IDENTITY_FILENAME);
  return loadIdentityFromFile(identityPath);
}
