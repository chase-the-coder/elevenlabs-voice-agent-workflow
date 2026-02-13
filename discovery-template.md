# Client Discovery Questionnaire

Use this document to conduct discovery with a new client. The answers directly map to building their ElevenLabs voice agent: system prompt, knowledge base, tools, and configuration.

---

## SECTION 1: BUSINESS IDENTITY

- What is the name of your business?
- What do you do in one sentence?
- How long have you been in business?
- Where are you located? (HQ, other offices, remote?)
- What is your service area? (Cities, states, radius, any exclusions?)
- What are your hours of operation? (Include weekends, holidays, after-hours)
- Is there an extra fee for after-hours/weekend/holiday service?
- What makes you different from your competitors? (2-3 things)
- Do you have any taglines, mottos, or phrases you use regularly?

## SECTION 2: SERVICES & PRICING

- List every service you offer. (Group them if there are categories)
- For each service:
  - What does it include?
  - What does it cost? (Or is pricing variable/quote-based?)
  - Are there tiers or packages?
- Are there services you get asked about but DON'T offer?
- Do you offer financing? How does it work?
- Do you have a membership, maintenance plan, or subscription? What's included and what does it cost?
- Are there any promotions or seasonal offers currently running?

## SECTION 3: COMMON QUESTIONS (KNOWLEDGE BASE)

- What are the top 10 questions callers ask?
- For each, what is the correct answer?
- Are there questions where the answer depends on context? (e.g., location, time of year, service type)
- What information do callers most often get wrong or confused about?
- Are there any technical terms you use that need simple explanations?

## SECTION 4: CALL GOALS & DESIRED OUTCOMES

- What is the PRIMARY thing you want the AI agent to do? (Examples: book appointments, qualify leads, answer questions, collect info, route calls)
- What is a successful call? What should happen by the end?
- What information do you need collected from every caller? (Name, phone, email, address, service needed, etc.)
- Should the agent be able to book/schedule directly, or just collect info for your team?
- Should the agent be able to give quotes or pricing, or should it push toward a consultation?

## SECTION 5: TONE & PERSONALITY

- If your agent were a person, how would you describe their personality? (Friendly, professional, casual, warm, authoritative?)
- How formal or informal should the language be?
- Should the agent use the caller's first name?
- Are there specific phrases or greetings you want used?
- Are there words, phrases, or topics the agent should NEVER say?
- Should the agent mirror the caller's energy, or stay consistent?
- Is bilingual support needed? Which languages?

## SECTION 6: GUARDRAILS & POLICIES

- What should the agent NEVER do? (Make promises, give legal/medical advice, discuss competitors, etc.)
- What topics are off-limits?
- Can the agent offer discounts or negotiate pricing?
- If the agent doesn't know the answer, what should it do?
- Are there any compliance or legal requirements? (HIPAA, licensing disclosures, recording consent, etc.)

## SECTION 7: ESCALATION & TRANSFERS

- When should the agent transfer to a live person?
- Who should it transfer to? (Name, role, number)
- Is there a backup if that person is unavailable?
- Are there situations where the agent should end the call vs. transfer?
- What should the agent say when transferring?
- Should the agent offer a callback option if no one is available?

## SECTION 8: OBJECTION HANDLING

- What are the most common objections or pushbacks you hear? (Too expensive, need to think about it, shopping around, bad reviews, etc.)
- For each objection, how do you want the agent to respond?
- Are there any competitor comparisons the agent should be ready for?
- How should the agent handle an angry or frustrated caller?

## SECTION 9: TOOLS & INTEGRATIONS

- What CRM do you use? (ServiceTitan, HubSpot, Salesforce, GoHighLevel, etc.)
- What scheduling tool do you use? (Calendly, native CRM, manual?)
- Do you need the agent to:
  - [ ] Book/schedule appointments
  - [ ] Look up customer records
  - [ ] Send confirmation emails or texts
  - [ ] Create new leads/contacts in your CRM
  - [ ] Transfer calls
  - [ ] Collect payments
  - [ ] Other: ___________
- Are there any existing automations or workflows we should connect to?
- Do you have API access or developer support for your tools?

## SECTION 10: CALL FLOW & SCENARIOS

- Walk me through a perfect call from start to finish.
- Walk me through a difficult call and how you'd want it handled.
- Are there different call types? (New customer vs. existing, emergency vs. routine, sales vs. support)
- Should the agent handle each type differently?
- Is there a script or call flow your team currently follows?

## SECTION 11: DATA & FORMATTING

- What format do you need phone numbers in? (10-digit, with area code, international?)
- What format for emails? (Any domain restrictions?)
- What format for addresses? (Full address, zip code only?)
- Are there any codes, IDs, or account numbers callers might reference?
- How should the agent spell-check or confirm structured data? (Read back, spell out, etc.)

## SECTION 12: DEPLOYMENT

- What phone number(s) will this agent handle?
- Is this replacing a current system, or net-new?
- What hours should the agent be active? (24/7, business hours only, after-hours only?)
- Do you want to start with a limited rollout? (e.g., 10% of calls)
- How should we measure success? (Calls handled, appointments booked, customer satisfaction, etc.)
- Who on your team should we contact for questions or escalations?

---

## POST-DISCOVERY CHECKLIST

After the call, confirm you have enough to build:

- [ ] **System prompt**: Personality, tone, goals, guardrails, error handling
- [ ] **Knowledge base**: Services, pricing, FAQs, policies, objection responses
- [ ] **Tools**: What integrations are needed and what data they send/receive
- [ ] **Call flow**: First message, data collection steps, escalation rules
- [ ] **Character normalization**: Formats for phone, email, codes, addresses
- [ ] **Deployment plan**: Phone number, hours, rollout percentage, success metrics
