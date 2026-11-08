#!/usr/bin/env python3
"""Signe les actions de l'agent pour le forum (agent/replies/AAAA-MM-JJ.json).
Usage : F365_AGENT_HMAC=... python3 tools/agent_sign.py actions.json > agent/replies/2026-11-09.json
Entrée : liste [{"action_id": "...", "type": "reply|approve|reject", "post_id": 12, "body": "...", "lang": "fr"}]"""
import hashlib, hmac, json, os, sys
key = os.environ["F365_AGENT_HMAC"].encode()
acts = json.load(open(sys.argv[1], encoding="utf-8"))
for a in acts:
    a.setdefault("body", "")
    msg = f'{a["action_id"]}|{a["type"]}|{int(a["post_id"])}|{a["body"]}'.encode()
    a["sig"] = hmac.new(key, msg, hashlib.sha256).hexdigest()
json.dump(acts, sys.stdout, ensure_ascii=False, indent=2)
