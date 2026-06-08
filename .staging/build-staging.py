#!/usr/bin/env python3
"""Stage keybank-factory verbatim from lab published v11 for replication into live.
Derives the 8 ADL v2 layout templates from the rendered packs and verifies every
content checksum against lab's published values. Fails loudly on any mismatch."""
import json, hashlib, os, sys, pathlib

ROOT = pathlib.Path("/home/aron/ai-workspace/codebases/theory.cloud/theory")
STG = ROOT / ".staging/kbf-lab"
SNAP = pathlib.Path("/home/aron/.claude/projects/-home-aron-ai-workspace-codebases-theory-cloud-theory/efff5895-5a53-464a-a091-ff43b34ade3b/tool-results/mcp-theorymcp_lab-agent_interface_snapshot_get-1780800018868.txt")
OUT = STG / "staged"
AGENT_URL = "https://lab.theorymcp.ai/theorycloud/agents/keybank-factory/mcp"

def sha(b):
    if isinstance(b, str): b = b.encode("utf-8")
    return "sha256:" + hashlib.sha256(b).hexdigest()

def rd(p):  # bytes
    return pathlib.Path(p).read_bytes()

fail = []
def check(label, content, expected):
    got = sha(content)
    ok = got == expected
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}: {got}{'' if ok else '  != '+expected}")
    if not ok: fail.append(label)
    return ok

snap = json.loads(SNAP.read_text())["snapshot"]
soul_body = snap["soul_body"]
skills = snap["skills"]

print("== soul ==")
check("soul_body == published soul_checksum", soul_body, snap["soul_checksum"])

print(f"== skills ({len(skills)}) : snapshot body == codex pack SKILL.md ==")
for sk in skills:
    packfile = STG / "codex" / ".codex/skills" / sk["slug"] / "SKILL.md"
    same = sha(sk["body"]) == sha(rd(packfile))
    if not same:
        print(f"  [FAIL] {sk['slug']} body mismatch snapshot vs pack"); fail.append("skill:"+sk["slug"])
print(f"  [PASS] all {len(skills)} skill bodies: snapshot == pack" if not any(f.startswith('skill:') for f in fail) else "  some skill bodies mismatched")

# ---- derive + verify the 8 distinct templates ----
print("== layout templates (derived from rendered packs, verified vs lab published) ==")
T = {}

# 1. {{soul}}  (GEMINI.md, .codex/steward.md)
T["soul"] = "{{soul}}"
check("{{soul}}", T["soul"], "sha256:26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6")

# 2. {{skill.body}}  (all SKILL.md)
T["skill"] = "{{skill.body}}"
check("{{skill.body}}", T["skill"], "sha256:2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87")

# 3. claude settings.json  (no placeholders -> rendered == template)
T["settings"] = rd(STG / "claude_code" / ".claude/settings.json").decode("utf-8")  # claude_code root
check("claude settings.json", T["settings"], "sha256:ee4c1b2eb17614f2bf147ae30f0b37e47950c8f93c24c01c27764c5fc0b29525")

# 4. claude output-style  (replace rendered soul body -> {{soul}})
rendered_os = rd(STG / "claude_code" / ".claude/output-styles/keybank-factory.md").decode("utf-8")
T["outputstyle"] = rendered_os.replace(soul_body, "{{soul}}")
check("claude output-style (frontmatter+{{soul}})", T["outputstyle"], "sha256:eeb95c8d4c1a887ab4e4cae9264334b04d612b40ab3c44a856985a4c3c81e0ce")

# 5. codex config.toml  (replace agent url -> {{mcp.url}})
rendered_cfg = rd(STG / "codex" / ".codex/config.toml").decode("utf-8")
T["configtoml"] = rendered_cfg.replace(AGENT_URL, "{{mcp.url}}")
check("codex config.toml", T["configtoml"], "sha256:58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3")

# 6. claude .mcp.json  (replace agent url -> {{mcp.url}})
rendered_mcp = rd(STG / "claude_code" / ".mcp.json").decode("utf-8")
T["mcpjson"] = rendered_mcp.replace(AGENT_URL, "{{mcp.url}}")
check("claude .mcp.json", T["mcpjson"], "sha256:eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d")

# 7. antigravity .agents/mcp_config.json  (replace agent url -> {{mcp.url}})
rendered_ag = rd(STG / "antigravity" / ".agents/mcp_config.json").decode("utf-8")
T["mcpconfig"] = rendered_ag.replace(AGENT_URL, "{{mcp.url}}")
check("antigravity mcp_config.json", T["mcpconfig"], "sha256:3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b")

if fail:
    print("\n!! VERIFICATION FAILED for:", fail); sys.exit(1)
print("\nAll content checksums verified against lab published v11.")

# ---- write staged artifacts ----
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "soul.md").write_text(soul_body)
skdir = OUT / "skills"; skdir.mkdir(exist_ok=True)
skills_meta = []
for sk in skills:
    d = skdir / sk["slug"]; d.mkdir(exist_ok=True)
    (d / "SKILL.md").write_text(sk["body"])
    skills_meta.append({"skill_id": sk["skill_id"], "slug": sk["slug"], "name": sk["name"],
                        "display_order": sk["display_order"], "description": sk.get("description","")})
(OUT / "skills.json").write_text(json.dumps(skills_meta, indent=2))

# ---- assemble the 3 layout specs (verbatim entry order + metadata from lab) ----
layouts = {
  "codex": {"spec_version":"agent-install-layout-v2","entries":[
    {"path":".codex/steward.md","media_type":"text/markdown","required":True,"content":T["soul"],
     "description":"Agent soul as the codex system prompt (wired via config.toml model_instructions_file)."},
    {"path":".codex/config.toml","media_type":"application/toml","required":True,"content":T["configtoml"],
     "description":"Author-controlled codex config: model_instructions_file + clean theorymcp route via {{mcp.url}}."},
    {"path":".codex/skills/{{skill.slug}}/SKILL.md","for_each":"skills","media_type":"text/markdown","required":True,"content":T["skill"],
     "description":"Each published skill, author-placed under .codex/skills/<slug>/SKILL.md."},
  ]},
  "claude_code": {"spec_version":"agent-install-layout-v2","entries":[
    {"path":".claude/output-styles/keybank-factory.md","media_type":"text/markdown","required":True,"content":T["outputstyle"],
     "description":"Soul as a Claude Code output style WITH author-defined frontmatter (system-prompt level; keep-coding-instructions:false)."},
    {"path":".claude/settings.json","media_type":"application/json","required":True,"content":T["settings"],
     "description":"Activates the keybank-factory output style on session open."},
    {"path":".mcp.json","media_type":"application/json","required":True,"content":T["mcpjson"],
     "description":"Project MCP config at repo root (theorymcp route via {{mcp.url}})."},
    {"path":".claude/skills/{{skill.slug}}/SKILL.md","for_each":"skills","media_type":"text/markdown","required":True,"content":T["skill"],
     "description":"Each published skill, author-placed under .claude/skills/<slug>/SKILL.md."},
  ]},
  "antigravity": {"spec_version":"agent-install-layout-v2","entries":[
    {"path":"GEMINI.md","media_type":"text/markdown","required":True,"content":T["soul"],
     "description":"Agent persona/identity as Antigravity workspace rules (GEMINI.md, always-on, highest precedence). Additive context — Antigravity offers no system-prompt override, so this is the strongest identity mechanism available."},
    {"path":".agents/skills/{{skill.slug}}/SKILL.md","for_each":"skills","media_type":"text/markdown","required":True,"content":T["skill"],
     "description":"Each published skill as an Antigravity Agent Skill (workspace .agents/skills/<slug>/SKILL.md; .agents is the 2.0 convention)."},
    {"path":".agents/mcp_config.json","media_type":"application/json","required":True,"content":T["mcpconfig"],
     "description":"Workspace MCP config: routes theorymcp through the mcp-remote stdio OAuth bridge (Antigravity speaks stdio but cannot perform the MCP OAuth flow; mcp-remote terminates it). {{mcp.url}} = the agent route."},
  ]},
}
ldir = OUT / "layouts"; ldir.mkdir(exist_ok=True)
for prof, spec in layouts.items():
    (ldir / f"{prof}.json").write_text(json.dumps(spec, indent=2))

manifest = {
  "agent_id":"keybank-factory","display_name":"KeyBank Factory",
  "source":{"namespace":"theorycloud","route":"lab.theorymcp.ai","published_version":11,
            "soul_version":snap["soul_version"],"soul_checksum":snap["soul_checksum"]},
  "skill_count":len(skills),
  "template_checksums":{k:sha(v) for k,v in T.items()},
}
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
print("Staged to", OUT)
print("  soul.md, skills/<slug>/SKILL.md (x{}), layouts/{{codex,claude_code,antigravity}}.json, skills.json, manifest.json".format(len(skills)))
