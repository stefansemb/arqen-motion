# Överlämning: Arqen Motion (2026-10-06)

## Vad appen är
Animerade grafikklipp till videor, som räknande siffror, citatkort, tidslinjer och jämförelser. Mallarna är vanlig HTML + GSAP och renderas till MP4 med HyperFrames (headless Chrome + FFmpeg). Alla mallar fungerar i 16:9 och 9:16, och `--size` ger valfritt format.

- Kräver Node 22+ och FFmpeg.
- Webb-UI: `npm start` på http://localhost:4320.
- CLI: `node motion.mjs <mall> värden.json [--portrait] [--size BxH] [--no-outro] [-o fil.mp4]`.
- Klippen hamnar i `renders/`, som är gitignorerad. `assets/` är också gitignorerad.
- Licens Apache 2.0. Repot `stefansemb/arqen-motion` är publikt.

## Läge: version 0.5.1
Nio mallar: `number`, `quote`, `timeline`, `compare`, `ranking`, `flow`, `steps`, `checklist` och `ring`. Detaljer finns i README.

Versioner, alla från 2026-10-05:
- **0.2.0:** `--size` för eget format.
- **0.3.0:** mallen `ranking` och `list --json` för andra appar.
- **0.4.0:** mallarna `flow`, `steps`, `checklist` och `ring`.
- **0.5.0:** fältet `cues` (sekunder) som tajmar när varje punkt visas mot berättarrösten.
- **0.5.1:** topplistor håller sig till ett mått.

## Koppling till Arqen AI Studio
- Studio hittar Motion via `MOTION_DIR` eller syskonmappen "Arqen Motion". Studio läser `node motion.mjs list --json` och erbjuder sin scenplanerare varje mall som har `motion-use` och fält med `hint`.
- En ny mall i Motion kräver därför ingen ändring i Studio. Lägg HTML-filen i `templates/`.
- Studio fyller `cues` från berättarrösten, så att punkterna tänds när de nämns. Shorts får klipp i 1080x730 utan beskärning.
- Saknas Motion, eller misslyckas en rendering, använder Studio sina egna kort.

## Synlighet och XP (2026-10-06)
- Motion har ett eget kort på samidatools.com, "Open source", med länkar till GitHub och YouTube-kanalen.
- I Arqen Mission Controls projektlista står Motion på 83 %. Nästa delmål är **Release 1.0**.
- Arqen AI Studios XP-system räknar commits (10, "Add ..." ger 30), versionstaggar (150) och klipp i `renders/` (5 per klipp).

## Att tänka på
- Inga automatiska tester. Provrendera en mall i både 16:9 och 9:16 efter ändringar.
- Tagga releaser som `vX.Y.Z`. Taggarna syns som releaser i XP-systemet.

## Nästa steg
- Release 1.0: bestäm vad som saknas, till exempel tester, fler mallar eller ett bättre webb-UI.
