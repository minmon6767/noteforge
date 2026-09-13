# NoteForge

NoteForge is an AI-powered student workspace that takes a single lecture PDF and instantly generates condensed, skimmable revision notes alongside a 5-question practice quiz. It's built for students who need to synthesize long materials quickly without wrestling with complex chat interfaces or multi-document knowledge bases.

[Live Demo](#) | [Watch 20s Walkthrough](#)

## Why this architecture

1. **Single LLM Call**: NoteForge uses one structured Gemini API call to generate both the notes tree and the quiz simultaneously. This halves latency and API cost compared to a multi-agent or multi-step pipeline. It also ensures the quiz is demonstrably grounded in the generated notes during a single reasoning pass.
2. **Client-side Parsing**: PDF parsing happens entirely in the browser using `pdfjs-dist`. We extract text, detect headings via font-size heuristics, and chunk into sections before the network call. This means no heavy file uploads to a backend server, sidestepping privacy concerns and upload bottlenecks.
3. **Deterministic Fallback**: If the API key is missing or the user is offline, NoteForge silently falls back to a deterministic, non-LLM extraction method (longest-sentence extraction + fill-in-the-blank generation). The app degrades gracefully rather than crashing.

## Quickstart

```bash
git clone https://github.com/your-username/noteforge.git
cd noteforge
cp .env.example .env.local
npm install && npm run dev
```

## What's deliberately not in scope

- **Multi-document dashboards**: The focus is strictly on a single document flow to maximize depth and polish over breadth.
- **User accounts & databases**: This is a stateless single-session tool. Everything lives in the URL and session storage.
- **Chat tutors**: Chat interfaces often encourage unstructured procrastination. NoteForge provides static, high-signal artifacts (Notes + Quiz) that encourage active recall.

## Architecture

```
Upload (Browser)
       │
       ▼
Parse & Chunk (pdfjs-dist)
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
Gemini API Route (Server) ───────▶ Fallback Extraction (Offline)
       │                                 │
       ▼                                 ▼
Validate (Zod Schema) ───────────▶ Render UI
                                         │
                                         ▼
                                  Export (MD, PDF)
```

## Known Trade-offs

- Quiz question quality is heavily dependent on document structure quality. Scanned PDFs with no selectable text or completely unstructured layouts will lean on the fallback path or produce less coherent LLM output.
- The client-side font-size heuristic for heading detection works well for standard slide decks and academic papers, but can struggle with highly stylized graphic-design-heavy PDFs.
