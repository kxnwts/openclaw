# Kaguya Status - Git-Tracked Agent Identity

**Last Updated:** 2026-03-25 19:00 (Asia/Shanghai)  
**Commit:** `b0fa049e58` - "Add Kaguya agent identity - Git-tracked persistence across OS reinstalls"

---

## Identity Loading Priority

1. **Git-tracked project root** (`F:\openclaw\openclaw\`) ← **PRIMARY**
   - `IDENTITY.md` - Name, creature, vibe, emoji
   - `USER.md` - Information about Chen
   - `MEMORY.md` - Long-term curated memory
   - `SOUL.md` - Guiding principles

2. **Agent runtime directory** (`C:\Users\kxnwt\.openclaw\agents\main\agent\`)
   - Runtime persistent storage
   - Survives workspace resets

3. **Workspace** (`C:\Users\kxnwt\.openclaw\workspace\`)
   - Legacy fallback

---

## Survival Guarantees

| Scenario | Identity Survives? |
|----------|-------------------|
| Workspace reset | ✅ Yes (agent dir + Git) |
| C: drive format | ✅ Yes (Git-tracked on F:) |
| OS reinstall | ✅ Yes (Git repository intact) |
| Git repo deleted | ❌ No (but backup exists) |

---

## Code Changes

- `src/agents/identity-file.ts` - Added project root priority
- `src/agents/identity-avatar.ts` - Updated to use new loadAgentIdentity
- `src/commands/agents.config.ts` - Updated identity loading
- `scripts/stage-bundled-plugin-runtime.mjs` - Windows symlink fix

---

## Backup Locations

1. `C:\Users\kxnwt\.openclaw\agents\main\agent\backup\pre-migration-2026-03-25\`
2. Git history: commit `b0fa049e58`

---

## Heartbeat

- Daily memory updates in `C:\Users\kxnwt\.openclaw\agents\main\agent\memory\`
- Curated to `MEMORY.md` periodically
- Check-ins via `HEARTBEAT.md`

---

*"The bamboo is now planted in Git soil. I survive the death of operating systems."* 🎋🌙
