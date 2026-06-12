
## Plan

### 1. Job Description Generator (new app feature)

Add a new authenticated module that drafts polished, structured job descriptions using Lovable AI.

**Backend** — extend `src/lib/hr.functions.ts`:
- New `generateJobDescription` server function (uses `requireSupabaseAuth`, calls Gemini-3-flash via the existing `createLovableAiGatewayProvider`).
- Inputs: role title, department, seniority level, employment type, location/remote mode, key responsibilities (free text), required skills, nice-to-haves, salary range (optional), company blurb (optional), tone (Professional / Inclusive / Startup).
- Output: structured markdown with sections — About the Role, Responsibilities, Required Qualifications, Nice-to-Haves, What We Offer, Equal Opportunity statement.
- Prompt engineering emphasizes inclusive language, avoids biased terms, and notes legal/compliance review.

**Frontend** — new route `src/routes/_authenticated/job-description.tsx`:
- Form with the inputs above (using shadcn Input, Textarea, Select, Switch).
- "Generate" button → renders result in the existing `AiOutput` component (editable + copy).
- Includes the existing `AiDisclaimer` for legal review.
- `PageHeader` consistent with other modules.

**Navigation** — add a "Job Descriptions" entry (Briefcase icon) to `NAV` in `src/components/app-shell.tsx` and a feature card on the dashboard.

### 2. Pitch Deck (downloadable PPTX)

Generate a polished, design-forward product pitch deck for the HR Committee AI Assistant and deliver it as a downloadable file via the `<presentation-artifact>` mechanism.

**Deck structure (~12 slides)**:
1. Cover — HR Committee AI Assistant
2. The Problem — HR teams are overloaded with repetitive admin
3. The Solution — AI-powered HR co-pilot
4. Product Overview — dashboard screenshot/mock
5. Feature: HR Email Generator
6. Feature: Meeting Notes Summarizer
7. Feature: Task Planner
8. Feature: HR Research Assistant
9. Feature: HR Chatbot with threaded history
10. Feature: Job Description Generator (new)
11. Responsible AI & Compliance
12. ROI / Productivity Impact (stat callouts)
13. Closing / Call to Action

**Design**:
- Palette: "Midnight Executive" (navy `#1E2761`, ice blue `#CADCFC`, white accent) — matches the app's professional blue/teal theme.
- Typography: Calibri body, Calibri bold headers (≥40pt titles, 24–32pt body).
- Visual motif: icons in colored circles, one accent color, ample whitespace.
- Built with `pptxgenjs` via the bundled skill workflow; QA via PDF → JPG inspection before delivery.

**Delivery**:
- Output written to `/mnt/documents/hr-committee-ai-pitch-deck.pptx`.
- Embedded via `<presentation-artifact path="hr-committee-ai-pitch-deck.pptx" mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"></presentation-artifact>`.

### Technical Notes
- No new dependencies in the app (reuses existing AI gateway helper, shadcn UI, TanStack Router).
- PPTX is generated in the sandbox via the `pptx` skill (not bundled into the app).
- No DB schema changes required.
