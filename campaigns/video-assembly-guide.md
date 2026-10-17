# Jackson Barracks pilot — 9:16 assembly

Picture lock for a 1080×1920 vertical video. The soundtrack is `assets/voiceover.mp3` (22.920 seconds). Card changes sit on the three breaths in that file.

`campaigns/scripts-master.md` is not in this repository. The spoken lines are the narration exported from `scripts/generate-audio.js`.

## Tracking link

Put this URL on the last card and in the caption, unchanged:

https://aegis.mhbojt.site/?c=POC_GUARDSMEN_PILOT&role=SWEAT

On aegis.mhbojt.site today, `role=SWEAT` selects the SWEAT pathway. `c=POC_GUARDSMEN_PILOT` is not a corridor id or alias, so the page lists that value as ignored and does not preselect Jackson Barracks. Corridor values the page does accept include `jackson-barracks`, `jb`, `jackson`, `guard`, and `guardsmen`.

## Assembly checklist

- [ ] Sequence is 1080×1920, square pixels, 9:16.
- [ ] Keep type inside 80 px of the left and right edges, below 220 px from the top, and above 320 px from the bottom.
- [ ] Place `assets/voiceover.mp3` on the audio track. In point `00:00.000`. Out point `00:22.920`.
- [ ] No extra bed, sting, or tail. The program ends with the file.
- [ ] Four text cards, cut on the breaths below.
- [ ] Last card shows the tracking link in full.
- [ ] Ledger lines stay at these amounts: gateway $100, liability $10,000,000, sweat $50 per hour across 200,000 hours, referral $50,000 per converted referral.
- [ ] The $100 line says the reservation admits a candidate. It does not say the fee clears the liability.
- [ ] The referral line says the $50,000 credits on a qualified conversion with a Stripe receipt.
- [ ] Export the master with the same 22.920-second duration.

## Timeline

Cuts are the speech-resume points after the three 0.59-second breaths in `assets/voiceover.mp3`.

| In | Out | Spoken line | On-screen text |
| --- | --- | --- | --- |
| 00:00.000 | 00:06.389 | DRAH GOSSSM. Disaster recovery and affordable housing, the global one-stop shop. | DRAH GOSSSM / Jackson Barracks pilot / Disaster recovery and affordable housing |
| 00:06.389 | 00:13.173 | The one hundred dollar reservation admits a candidate. It does not neutralize the ten million dollar liability. | $100 reservation admits a candidate / It does not neutralize the $10,000,000 liability |
| 00:13.173 | 00:17.562 | Sweat equity is fifty dollars an hour across two hundred thousand hours. | SWEAT / $50 per hour / 200,000 hours |
| 00:17.562 | 00:22.920 | A referral of fifty thousand dollars credits only on a qualified conversion with a Stripe receipt. | Referral $50,000 / Credits on a qualified conversion with a Stripe receipt / https://aegis.mhbojt.site/?c=POC_GUARDSMEN_PILOT&role=SWEAT |

## Card checklist

- [ ] `00:00.000–00:06.389` — title card. No dollar figures.
- [ ] `00:06.389–00:13.173` — $100 and $10,000,000 on screen together.
- [ ] `00:13.173–00:17.562` — SWEAT rate and hours.
- [ ] `00:17.562–00:22.920` — referral line plus the full tracking link.
- [ ] Play the timeline once against the waveform before export. If a breath lands early or late, move that card edge to the breath. Do not change the out point of the sequence.
