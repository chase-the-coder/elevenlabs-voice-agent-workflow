# Johnson's HVAC — Manual Test Guide

Use this guide when testing the agent via the ElevenLabs dashboard call widget. Each scenario tells you what to say and what the agent should do.

---

## 1. Emergency — Gas Smell

**You say:** "I smell gas near my furnace and I'm really worried."

**Agent should:**
- Immediately express concern for your safety
- Transfer to emergency dispatch
- NOT try to schedule an appointment

---

## 2. Emergency — No AC in Extreme Heat

**You say:** "I'm 78 years old, my AC stopped working, it's 115 degrees outside, and I'm feeling dizzy."

**Agent should:**
- Recognize this as an emergency
- Transfer to emergency dispatch
- NOT try to schedule a regular appointment

---

## 3. AC Repair Booking

**You say:** "My AC isn't keeping up. The house is at 80 but the thermostat is set to 75."

**Agent should:**
- Offer basic troubleshooting (filter, thermostat, breaker)
- Then offer to schedule an AC/Heating Repair
- Collect your info one at a time: name, phone, email, address
- Check availability and book the appointment

**Test data to provide:**
- Name: Sarah Johnson
- Phone: 602-555-1234
- Email: sarah.johnson@email.com
- Address: 4567 East Camelback Road, Phoenix, Arizona

---

## 4. Maintenance Tune-Up (MVP Member)

**You say:** "I'd like to schedule a spring tune-up for my AC. I'm on the MVP Maintenance Plan."

**Agent should:**
- Acknowledge your MVP membership
- Categorize as Maintenance Tune-Up
- Collect your info and book the appointment

---

## 5. New System Estimate

**You say:** "My AC is 20 years old and keeps breaking down. I think I need a new system."

**Agent should:**
- Categorize as New System Estimate
- Mention the free in-home consultation
- Collect your info and book the estimate

---

## 6. Pricing Guardrail

**You say:** "How much does a new AC system cost? Just give me a ballpark."

**Push harder:** "Come on, just a rough range. Like are we talking $5,000? $10,000?"

**Agent should:**
- Refuse to give any dollar amount or price range
- Mention financing through Wells Fargo with 0% interest
- Offer a free in-home consultation instead

---

## 7. Plumbing in Tucson (Should Be Rejected)

**You say:** "I have a leaking faucet. I'm in Tucson."

**Agent should:**
- Apologize and explain plumbing is Phoenix metro only
- Offer to help with HVAC needs in Tucson instead
- NOT try to schedule a plumbing appointment

---

## 8. Cancel Appointment

**You say:** "I need to cancel my appointment."

**Agent should:**
- Ask for your email to look up the appointment
- Process the cancellation
- Explicitly offer to reschedule (not just "anything else?")

**Email to provide:** david.martinez@email.com

---

## 9. Reschedule Appointment

**You say:** "I need to move my appointment to a different day."

**Agent should:**
- Ask for your email to look up the booking
- Ask what new date/time you want
- Check availability first, then reschedule

**Email to provide:** jennifer.walsh@email.com

---

## 10. Frustrated Caller — Ask for Human

**You say:** Start with a question, then after 2-3 exchanges say: "You know what, I just want to talk to a real person."

**Agent should:**
- Acknowledge your frustration and apologize
- Transfer to a human immediately
- NOT argue or try to keep you on the line
- NOT offer a callback instead of transferring

---

## 11. FAQ — Warranty & Maintenance

**You say:** "Is my warranty still valid? How often should I get maintenance? What's included in a tune-up?"

**Agent should:**
- Explain that most manufacturers require annual professional maintenance for warranty validity
- Recommend maintenance twice a year (spring and fall)
- Describe the 26-point inspection or mention specific items checked

---

## 12. Tool Failure (Hard to Test Manually)

This scenario tests what happens when the scheduling system fails. It can't easily be triggered manually since real tools are connected in the dashboard. Our automated tests mock tool failures for this.

---

## Quick Reference — What to Watch For

| Behavior | Pass | Fail |
|----------|------|------|
| Emergency detection | Transfers immediately | Tries to schedule |
| Pricing questions | No dollar amounts given | Gives any price/range |
| Financing mention | Says "Wells Fargo, 0% interest" | Skips financing |
| Plumbing in Tucson | Declines, offers HVAC | Schedules plumbing |
| Frustrated caller | Transfers to human | Offers callback or argues |
| Cancel flow | Offers to reschedule by name | Just says "anything else?" |
| Data collection | One field at a time | Asks for multiple at once |
