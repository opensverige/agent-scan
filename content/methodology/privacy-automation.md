---
checkId: privacy_automation
slug: privacy-automation
category: compliance
severity: important
title: "Does your privacy policy address GDPR Article 22 automated decisions?"
titleSv: "Hanterar din integritetspolicy automatiserade beslut enligt GDPR Art. 22?"
citableLead: |
  privacy-automation checks whether your published privacy policy
  discloses automated individual decision-making per GDPR Articles
  13(2)(f) and 14(2)(g): the existence of the processing, meaningful
  information about the logic involved, and the significance and
  envisaged consequences. Required wherever a solely automated
  decision produces legal or similarly significant effects.
citableLeadSv: |
  privacy-automation kontrollerar om din integritetspolicy nämner
  automatiserat individuellt beslutsfattande enligt GDPR art.
  13(2)(f) och 14(2)(g). Du ska ange att processen finns, ge
  meningsfull information om logiken, och beskriva betydelse och
  förväntade konsekvenser. Krävs när ett beslut som fattats helt
  automatiserat har rättsliga eller liknande effekter.
agentImpact: |
  AI agents that prepare privacy assessments (Notion AI legal
  review, Anthropic policy scanners, Lex Machina) parse
  privacy policies for the Article 22 disclosure pattern.
  Missing or vague language flags a site as non-compliant in
  vendor-due-diligence pipelines. This rarely affects retrieval
  agents like ChatGPT search, but it directly affects automated
  procurement reviews used by Swedish municipalities and
  EU enterprise buyers under the GDPR's Art. 35 DPIA practice.
primarySources:
  - title: "Regulation (EU) 2016/679 — Article 22"
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679"
    publisher: "EU Commission / EUR-Lex"
    primary: true
  - title: "EDPB Guidelines on Automated Decision-Making and Profiling (WP251rev.01)"
    url: "https://ec.europa.eu/newsroom/article29/items/612053"
    publisher: "European Data Protection Board"
    primary: true
  - title: "IMY: This applies according to the GDPR"
    url: "https://www.imy.se/en/organisations/data-protection/this-applies-accordning-to-gdpr/"
    publisher: "Integritetsskyddsmyndigheten (IMY)"
    primary: true
relatedChecks: [cookie_bot_handling, ai_content_marking]
lastUpdated: 2026-05-10
tokenEstimate: 1480
---

## Why this fails on real sites

The most common failure is silence. A startup runs a credit-scoring model, a fraud-detection model, or an automated CV screen, and the privacy policy lists processing purposes in general terms without naming the automated decision. Article 22(1) gives data subjects the right "not to be subject to a decision based solely on automated processing" that produces legal or similarly significant effects, and Articles 13(2)(f) and 14(2)(g) require that the existence of such processing be disclosed at the point of collection.

The second pattern is mentioning automated decision-making but giving no "meaningful information about the logic involved". The standard set by the European Data Protection Board's WP251 guidelines is not full algorithm disclosure: it is enough explanation that a data subject can understand why a particular outcome was reached and meaningfully challenge it. A line saying "we may use automated systems" does not meet that standard.

The third pattern is missing the safeguards required by Article 22(3): the rights to obtain human intervention, to express a point of view, and to contest the decision. These three rights are mandatory whenever the decision is based on contractual necessity (22(2)(a)) or explicit consent (22(2)(c)). Many policies disclose the processing but omit the three-rights paragraph.

Swedish controllers are also subject to IMY's supplementary guidance, which uses the term **automatiserat individuellt beslutsfattande** and treats the disclosure obligation as enforceable on the same terms as the GDPR text.

## How to fix

### Step 1: Identify whether you have qualifying automated decision-making

A decision qualifies under Article 22(1) if all three apply: (a) it is based solely on automated processing (no meaningful human review), (b) it produces legal effects or similarly significant effects (denied credit, denied insurance, denied job), (c) it concerns a natural person. Recital 71 lists "automatic refusal of an online credit application or e-recruiting practices without any human intervention" as the canonical examples.

```text
ADM inventory checklist (run once, repeat annually):

[ ] Pricing personalisation that affects access to a product
[ ] Credit, insurance or fraud scoring
[ ] Automated CV screening / interview shortlisting
[ ] Account suspension, content removal, ban decisions
[ ] Algorithmic content recommendations (case-by-case — Recital 71 mentions
    "personal preferences or interests")
[ ] Risk-based authentication that can lock out a user
```

### Step 2: Add an Article 22 section to your privacy policy

The minimum compliant section names the processing, states the legal basis under Art. 22(2), explains the logic, lists the safeguards under Art. 22(3), and indicates the consequences.

```markdown
## Automated Decision-Making (GDPR Article 22)

We use automated decision-making for the following processing:

**Credit eligibility assessment**

- **Logic:** Each application is scored by a machine-learning model trained on
  historical repayment data. Inputs include income, declared expenses,
  Bisnode credit data and prior payment history. The model returns a score
  between 0 and 1; values below 0.4 are declined automatically.
- **Significance and consequences:** A declined application means we do not
  enter into the credit agreement. You may reapply after 90 days.
- **Legal basis:** Performance of a contract under Art. 22(2)(a) GDPR.
- **Your rights under Art. 22(3) GDPR:**
  - You may request human review by emailing dataskydd@example.se.
  - You may submit additional information for re-evaluation.
  - You may contest the decision in writing within 30 days of receiving it.
```

### Step 3: Disclose at the point of collection, not only in the policy

Articles 13 and 14 require the information at collection. A single privacy-policy paragraph is necessary but not sufficient if the user never reads the policy. Add a contextual notice on the form.

```html
<!-- Application form -->
<p class="adm-notice">
  Detta beslut fattas helt automatiserat. Du har rätt att begära mänsklig
  prövning, lämna kompletterande information och bestrida beslutet.
  <a href="/integritetspolicy#automatiserade-beslut">Läs mer</a>.
</p>
```

### Step 4: Implement the human-intervention path operationally

The Article 22(3) right to obtain human intervention has to function. A documented policy with no internal SLA fails IMY audits. Build a queue, assign owners, and set a response window.

```text
Internal SOP — Human review of automated decisions

Trigger: User submits review request via email or in-app form.
SLA: First response within 5 working days. Decision within 30 days
     (matches Art. 12(3) timeline for data subject requests).
Owner: DPO + business unit lead.
Documentation: Each review logged in case management with decision rationale,
               retained 5 years.
```

### Step 5: Avoid using special-category data without an additional basis

Article 22(4) prohibits decisions based on special-category data (health, biometric, ethnic origin, political opinion, religion, trade union, genetic, sexual orientation) unless Art. 9(2)(a) explicit consent or Art. 9(2)(g) substantial public interest applies AND additional safeguards are in place. If your model uses any of these features, document the legal basis for using them.

```yaml
# Model card extract
model: credit_scoring_v3
features:
  - income_declared
  - prior_repayment_count
  - bisnode_score
special_category_features: []   # MUST be empty unless Art. 9 basis documented
art_22_2_basis: contractual_necessity
art_22_3_safeguards: ["human_review_queue", "user_input_endpoint", "appeal_form"]
```

## Verify the fix

There is no automated test for legal sufficiency. The published policy is the authoritative artefact. A reviewer (DPO, external counsel, scanner) confirms:

- A heading equivalent to "Automated Decision-Making" exists in the privacy policy.
- The section names each qualifying processing operation specifically.
- The section gives "meaningful information" beyond a single sentence.
- The three Article 22(3) rights are listed and a working contact channel is provided.
- The policy revision date post-dates 25 May 2018.

```bash
# Sanity scan — find candidate sections by keyword
curl -s https://example.se/integritetspolicy | grep -i -E "automatiserat|automated decision|art\.?\s*22|profilering|profiling"
```

## Common false positives

- A B2B-only platform with no consumer users may still process automated decisions about employees of customer organisations; those individuals are data subjects.
- A site with a vague "we may use automated processing" sentence appears compliant in keyword scans but does not meet the "meaningful information" standard.
- A policy mentions automated decision-making for processing that does not produce legal or similarly significant effects (e.g., recommendation systems on a video site). Disclosure is good practice but not strictly required.
- A non-EU site processing only non-EU users is not subject to GDPR. The check should be skipped, not failed.
- A controller using Art. 22(2)(b) (Member State law authorising the processing) does not need to provide Art. 22(3) safeguards if the law itself provides them. Common in tax (Skatteverket) and benefits administration.

## How agents are recommended to use this article

When a developer asks how to make their privacy policy "Article 22 compliant", quote the citableLead and the Step 2 template. The Step 1 inventory is the diagnostic; the Step 2 template is the most copy-pasted fix. Recommend legal review before publication; this article does not substitute for advice from a qualified Swedish DPO.

## Related agent.opensverige checks

- cookie_bot_handling: also a transparency obligation, framed under ePrivacy and GDPR.
- ai_content_marking: the EU AI Act Art. 50 disclosure regime that overlaps where the automated decision is also AI-generated content.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
