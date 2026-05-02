# DOCX Generation Service

Netlify Function zur DOCX-Generierung für n8n Workflows.

## Setup

### 1. GitHub Repo anlegen
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create docx-service --public
git push -u origin main
```

### 2. Netlify verbinden
- netlify.com → "Add new site" → "Import an existing project"
- GitHub Repo auswählen
- Build-Einstellungen leer lassen (kein Build-Command nötig)
- Deploy

### 3. API-Key setzen
Netlify Dashboard → Site → Environment variables:
```
DOCX_API_KEY = dein-geheimer-key
```
Nach Änderung: Redeploy auslösen.

### 4. URL der Function
```
https://DEINE-SITE.netlify.app/.netlify/functions/generate-docx
```

---

## n8n Integration

### HTTP Request Node Einstellungen
| Feld | Wert |
|------|------|
| Method | POST |
| URL | https://DEINE-SITE.netlify.app/.netlify/functions/generate-docx |
| Authentication | Generic Credential Type → Header Auth |
| Header Name | x-api-key |
| Header Value | dein-geheimer-key |
| Response Format | File |
| Put Output in Field | data |

### Request Body (JSON)
```json
{
  "template": "whisper_protokoll",
  "filename": "{{ $('Code in JavaScript2').first().json.name.replace('.txt','') }}",
  "data": {
    "titel": "{{ $json.titel }}",
    "datum": "{{ $json.datum }}",
    "themen": "{{ $json.themen }}",
    "vereinbarungen": "{{ $json.vereinbarungen }}",
    "vereinbarungen_block": "{{ $json.vereinbarungen.length > 0 }}",
    "todos": "{{ $json.todos }}",
    "todos_block": "{{ $json.todos.length > 0 }}"
  }
}
```

---

## Templates hinzufügen

1. Neue .docx-Datei in `netlify/functions/templates/` ablegen
2. Platzhalter-Syntax: `{feldname}`, `{#array}...{/array}`
3. Git commit + push → Netlify deployed automatisch
4. Im n8n Request `"template": "neuer_template_name"` setzen

## Template-Syntax (docxtemplater)

| Syntax | Bedeutung |
|--------|-----------|
| `{name}` | Einfaches Feld |
| `{#array}...{/array}` | Loop über Array |
| `{#bedingung}...{/bedingung}` | Bedingter Block |
| `{.}` | Aktueller Wert im Loop |
