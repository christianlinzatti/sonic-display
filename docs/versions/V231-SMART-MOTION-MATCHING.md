# V231 Smart Motion Matching 2.0

Das Motion Transition Studio sucht einen geeigneten Eintrittspunkt im nächsten Clip anhand gleichnamiger retargeteter Spuren, Pose und kurzer Bewegungsrichtung. Quaternionen werden vorzeicheninvariant verglichen. Ohne gemeinsame Spuren fällt die Vorschau auf den bisherigen Crossfade zurück. Die Beat-Trigger-Logik bleibt unverändert.

Die Suchfunktion prüft maximal 48 mögliche Eintrittspunkte, nur beim tatsächlichen Clipwechsel. Bestehende Studio-Einstellungen werden nicht überschrieben. Der Live-Bühnenwechsel verwendet weiterhin die vorhandene Pipeline; das neue Matching gilt für das interaktive Motion Transition Studio.
