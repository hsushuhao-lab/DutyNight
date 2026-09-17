# DutyNight Canonical Art Style Lock

Status: **HARD GATE**  
Applies to: Act 1 and all future scene work unless the PI explicitly revises this document.

## 1. Core visual thesis

Act 1 must feel like a **believable Taiwanese psychiatric hospital night-duty shift before anything supernatural happens**. The player should first trust the place, understand the work routine, and feel that the duty room is a temporary refuge. Horror comes from later contradiction, not from making the opening look haunted.

### Canonical keywords
- realistic / grounded
- warm late-afternoon to early-evening
- lived-in clinical workplace
- quiet but not ominous
- wood + glass + warm-neutral hospital materials
- controlled access without prison imagery
- independent private duty room with a real door

## 2. Hard prohibitions

Any change below is an automatic FAIL:

- No generic greybox as a final visual state.
- No blue horror filter in Act 1.
- No excessive orange cinematic wash.
- No cyberpunk / holographic / sci-fi HIS UI.
- No prison-like psychiatric ward language, giant red danger plaques, cage aesthetics, or sensationalized warning imagery.
- No unverified room numbers. **Do not use `422` for the duty room unless the PI explicitly approves it.**
- No real hospital-identifying UI in the public prototype. Use the fictional in-universe name **松德醫療中心**.
- No Bed 33 foreshadowing in Act 1. **Bed 33 belongs to the later legend and must not appear in the normal handoff list, whiteboard, HIS, or signage.**
- No doppelgänger, 00:33 anomaly, skybridge horror, sixth-floor anomaly, pond, or other later-act supernatural imagery in Act 1.

## 3. Act 1 visual targets

### 3F administrative corridor
- late-afternoon daylight / sunset spill
- warm-neutral practical ceiling lights around 3800–4200K
- pale warm walls, light hospital vinyl floor
- wood protection rails / modest wall protection
- bulletin boards, simple seating, water dispenser, plants, ordinary work clutter
- asymmetry and believable use, not showroom symmetry

### Room 316 chief resident office
- clearly a working physician office
- duty log, key location, ordinary paperwork, folders, telephone, stationery, whiteboard
- warm desk/task lighting
- no luxury-office styling
- no invented sensitive or real-world identifying data

### HIS workstation
- restrained public-hospital information-system language
- information dense but utilitarian
- fictionalized institution and fictional patient data only
- no dramatic slogans required
- no Bed 33 in Act 1

### 4F ward arrival
- quieter and more controlled than 3F
- access-controlled psychiatric ward, but still humane and clinically ordinary
- neutral green/wood/white palette
- nursing station should read as a care hub, not a security bunker

### Duty room
- independent private room
- must have a door
- warm and safe
- bed, desk, lamp, simple personal-duty objects
- no unverified room number
- this is the player's recurring refuge; later horror depends on the player trusting it first

## 4. Lighting progression

Act 1: warm normality.  
Later acts may gradually remove warmth, reduce occupancy, introduce cooler fluorescent dominance and spatial contradiction. Never import later-act horror lighting backward into Act 1.

## 5. Required regression checks

Before merging any art change:

1. Does Act 1 still look normal and warm rather than haunted?
2. Is the public build fictionalized?
3. Is Bed 33 absent from Act 1 normal records?
4. Is the duty room number-free unless explicitly approved?
5. Does the psychiatric ward feel controlled but humane?
6. Do all existing interactions still work?
7. Does `npm run build` pass?
8. Are QA screenshots regenerated for corridor, 316, HIS, elevator, 4F gate, duty room?

If any answer is no, do not continue to Act 2.
