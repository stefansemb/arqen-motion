# Överlämning: Arqen Motion (2026-10-06)

## Vad appen är
Animerade grafikklipp till videor, som räknande siffror, citatkort, tidslinjer och jämförelser. Mallarna är vanlig HTML + GSAP och renderas till MP4 med HyperFrames (headless Chrome + FFmpeg). Alla mallar fungerar i 16:9 och 9:16, och `--size` ger valfritt format.

- Kräver Node 22+ och FFmpeg.
- Webb-UI: `npm start` på http://localhost:4320.
- CLI: `node motion.mjs <mall> värden.json [--portrait] [--size BxH] [--no-outro] [-o fil.mp4]`.
- Klippen hamnar i `renders/`, som är gitignorerad. `assets/` är också gitignorerad.
- Licens Apache 2.0. Repot `stefansemb/arqen-motion` är publikt.

## Läge: version 1.0.1 (släppt 2026-10-06)
Nio mallar: `number`, `quote`, `timeline`, `compare`, `ranking`, `flow`, `steps`, `checklist` och `ring`. Detaljer finns i README.

Versioner, alla från 2026-10-05:
- **0.2.0:** `--size` för eget format.
- **0.3.0:** mallen `ranking` och `list --json` för andra appar.
- **0.4.0:** mallarna `flow`, `steps`, `checklist` och `ring`.
- **0.5.0:** fältet `cues` (sekunder) som tajmar när varje punkt visas mot berättarrösten.
- **0.5.1:** topplistor håller sig till ett mått.
- **1.0.0 (2026-10-06):** första stabila versionen, med samma funktioner som 0.5.1. Inför releasen provrenderades `number` (1920x1080) och `checklist` (1080x1920). Mallnamn, fält och CLI-flaggor räknas nu som stabila: ändra dem inte utan en ny huvudversion, eftersom Studio är beroende av dem.
- **1.0.1 (2026-10-06):** allt användaren ser är översatt till engelska (mallnamn, fältetiketter, webb-UI, CLI och felmeddelanden). Fält-id:n är oförändrade.

## Koppling till Arqen AI Studio
- Studio hittar Motion via `MOTION_DIR` eller syskonmappen "Arqen Motion". Studio läser `node motion.mjs list --json` och erbjuder sin scenplanerare varje mall som har `motion-use` och fält med `hint`.
- En ny mall i Motion kräver därför ingen ändring i Studio. Lägg HTML-filen i `templates/`.
- Studio fyller `cues` från berättarrösten, så att punkterna tänds när de nämns. Shorts får klipp i 1080x730 utan beskärning.
- Saknas Motion, eller misslyckas en rendering, använder Studio sina egna kort.

## Synlighet och XP (2026-10-06)
- Motion har ett eget kort på samidatools.com, "Open source", med länkar till GitHub och YouTube-kanalen.
- I Arqen Mission Controls projektlista står Motion på 100 % efter Release 1.0.
- Arqen AI Studios XP-system räknar commits (10, "Add ..." ger 30), versionstaggar (150) och klipp i `renders/` (5 per klipp).

## Att tänka på
- Allt som användaren ser är på engelska sedan 2026-10-06: mallnamn, fält, webb-UI, CLI-hjälp och felmeddelanden. Håll det så, eftersom repot är publikt.
- Inga automatiska tester. Provrendera en mall i både 16:9 och 9:16 efter ändringar.
- Tagga releaser som `vX.Y.Z`. Taggarna syns som releaser i XP-systemet.

## Nästa steg
- Automatiska tester, till exempel en snabb rendering av varje mall.
- Fler mallar efter behov i videorna.
