# Templates Directory - Quick Reference

**For detailed usage**: See [_archive/USAGE.archived.2025-10-09.md](./_archive/USAGE.archived.2025-10-09.md)

---

## Templates in This Directory

| Template | Purpose | Validation |
|----------|---------|------------|
| [user.copilot.docs.stb-template.v2025.10.10.md](./user.copilot.docs.stb-template.v2025.10.10.md) | Single Task Block (STB) template | ✅ Compliant |
| [user.copilot.templates.system-instructions-template.v2025.10.10.md](./user.copilot.templates.system-instructions-template.v2025.10.10.md) | System Instructions for AI agents | ✅ Compliant |

---

## Quick Start

### Create New STB
```powershell
cp templates/user.copilot.docs.stb-template.v2025.10.10.md `
   templates/user.copilot.{domain}.{purpose}.v2025.10.10.md

# Edit headers to match filename
npm run validate:stb
```

### Create System Instructions
```powershell
cp templates/user.copilot.templates.system-instructions-template.v2025.10.10.md `
   assistants/your-agent.system-instructions.v2025.10.10.md

# Customize agent name, role, domain
```

---

## Validation

```powershell
npm run validate:stb
```

**Note**: Only files matching `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md` are validated.

---

## See Also

- [README.md](./README.md) - Full template governance
- [docs/STB_VALIDATION.md](../docs/STB_VALIDATION.md) - Validation protocol
- [_archive/](./_archive/) - Historical templates
