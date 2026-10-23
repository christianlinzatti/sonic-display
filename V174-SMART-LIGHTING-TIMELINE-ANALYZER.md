# V174 – Smart Lighting Timeline Analyzer

Uses a bounded rolling history (up to 1,800 samples collected roughly every 450 ms) from **the currently played track**. The browser cannot obtain full Spotify PCM for retrospective analysis; without listening to the passage, no measured evidence is available.

The analyzer bins observed energy, bass and beats into two-second windows, detects candidate breaks, rising build-ups and bass/energy transitions, assigns a **heuristic confidence score**, and combines stronger observed candidates with low-confidence V173 BPM/phrase proposals. Sparse windows are penalized, overlaps are deduplicated, and the number of suggestions is bounded.

Click **Lichtshow generieren** in the Light Studio after playing a portion of the song. Results explicitly distinguish Live-Messung from Phrasen-Schätzung and show a score and reason. No proposed cue is automatically committed. Accept selected proposals, edit them and save the timeline manually. Existing song-specific manual cues remain untouched until the user chooses to merge. Data is held in memory only; saved cues remain localStorage-based as before.

Caveat: this is not a Spotify audio-analysis API integration, not a full-track waveform scan, and confidence is not a calibrated probability. Studio and GPU runtime still require device testing.
