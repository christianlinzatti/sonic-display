# V226 – Interactive Performance Tuning Studio

An interactive A/B quality-tier trial is available inside the existing automatic benchmark screen. First the current quality setting is sampled, then a selected High/Balanced/Low candidate is temporarily applied. Each phase lasts 6.5 s including 1.5 s warm-up. The comparison displays mean FPS, frame time and slow-frame percentage, using existing diagnostics only. Trial quality is always restored when a test completes, fails, is canceled or the component unmounts. The user must explicitly click **Testprofil übernehmen** to apply a candidate, and can separately save the applied quality as a device profile with the existing PerformanceProfiles interface.

The automatic benchmark and interactive trial are mutually exclusive. The studio changes only the existing quality tier, not shadows, character models or other settings. Measure comparable scenes and tracks for meaningful A/B results.
