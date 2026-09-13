# Architecture & Engineering Decisions

## 1. Single LLM Call for Notes + Quiz
**Context:** We need both structured revision notes and a multiple-choice quiz.
**Decision:** We prompt the Gemini API once, enforcing a combined Zod schema for the response. 
**Why:**
- Latency: Two separate LLM calls for a 20-page PDF would easily push processing time over 20s. A combined call keeps it under 10-15s.
- Cost: Halves the token input costs.
- Coherence: Generating the quiz in the same pass ensures the questions directly reflect the notes that were just summarized.

## 2. Client-side Document Parsing
**Context:** Extracting text from PDFs can be computationally heavy.
**Decision:** Use `pdfjs-dist` in the browser to extract text and detect font sizes.
**Why:**
- Privacy: No user lecture materials are saved on a server.
- Speed: Bypasses the need to upload a potentially 50MB PDF to a Vercel serverless function (which has strict payload limits anyway). We only send the extracted text strings to our API route.

## 3. Stateless Architecture (No Database)
**Context:** Most SaaS apps use Postgres + Prisma + Auth.
**Decision:** Use React state and `sessionStorage`.
**Why:**
- Focus on the core value prop. User accounts don't make the AI any better. 
- A single-session tool is vastly easier for judges to evaluate (no sign-up wall).

## 4. Deterministic Offline Fallback
**Context:** Hackathon demos often fail due to rate limits or API key issues.
**Decision:** Shipped a `lib/extract-fallback.ts` that uses basic text heuristics to generate output if the LLM fails.
**Why:**
- "Graceful degradation". An app that still somewhat works offline is much more impressive than a red alert box saying "API Error".

## 5. UI: The "Annotated Desk" Aesthetic
**Context:** We want to avoid the generic SaaS look.
**Decision:** Used `Lora` (serif) and `Space Grotesk`, a warm `#fcfaf5` paper background, and a highlighter yellow accent.
**Why:**
- Signals "study material" visually. Reduces cognitive load compared to high-contrast dark modes.
