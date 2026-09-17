# MASTER PROMPT FOR IMPLEMENTATION AGENT — ACT 1

You are implementing Act 1 of an Unreal Engine 5 first-person psychological-horror game.

## Goal
Build a playable 35–55 minute Act 1 that feels like a believable psychiatric-hospital night shift from 17:00 to 21:00. The act is warm and ordinary until the final minutes. The first contradiction occurs only at the end: a nurse tells the player, “醫師，你剛剛不是才來過嗎？”

## Non-negotiable design rules
1. Normality first. No monster, ghost, chase, jump scare or overt supernatural VFX in Act 1.
2. Use only the locations required by Act 1. Do not load or build Second Campus, skybridge, pond or Floor 6.
3. Duty room is an independent private room with a real closable door.
4. Psychiatric ward is closed/controlled, but never visually framed as a haunted prison.
5. Clinical tasks are fictionalized abstractions; do not implement real treatment algorithms or dosing.
6. Real reference floor plans are restricted. Use only high-level topology and compress distances. Do not reproduce exact security/evacuation layouts.
7. Every change must map to a testable success criterion. Do not refactor unrelated code.

## Required implementation order
A. Project/first-person skeleton
B. Interaction base
C. 3F blockout + key/log/handoff
D. 4F nursing station + duty room + ward cluster
E. Routine task loop
F. Phone/call flow
G. Documentation UI mock
H. Priority window
I. End anomaly + three choices
J. Save persistent choice state
K. QA pass

## Required outputs after each milestone
- short changelog
- affected files
- test performed
- PASS/FAIL
- screenshot(s) when visual

## Definition of Done
Use `00_README/SUCCESS_CRITERIA.md` exactly. Do not declare completion if any mandatory item fails.
