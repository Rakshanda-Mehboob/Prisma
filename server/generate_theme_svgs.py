"""
generate_theme_svgs.py — Generates 21 high-quality, distinct vector SVG illustrations
for the 7 cyberbullying assessment themes (3 unique variants per theme).
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent / "static" / "scenario_images" / "themes"

THEME_META = {
    "mockery": {
        "title": "Mockery & Public Ridicule",
        "sub": "Derogatory comments and meme-based peer targeting",
        "primary": "#4f46e5",
        "secondary": "#ec4899",
        "bg_gradient": ("#f5f3ff", "#fdf2f8"),
        "icon": "🎭",
    },
    "exclusion": {
        "title": "Social Exclusion & Isolation",
        "sub": "Deliberate removal and quiet peer ostracization",
        "primary": "#0891b2",
        "secondary": "#64748b",
        "bg_gradient": ("#ecfeff", "#f1f5f9"),
        "icon": "🚪",
    },
    "private_info_leak": {
        "title": "Confidential Info Leak",
        "sub": "Unauthorized sharing of personal messages and data",
        "primary": "#d97706",
        "secondary": "#dc2626",
        "bg_gradient": ("#fffbeb", "#fef2f2"),
        "icon": "🔓",
    },
    "false_rumour": {
        "title": "False Rumour & Misinformation",
        "sub": "Unverified claims and peer smear campaigns",
        "primary": "#ea580c",
        "secondary": "#7c3aed",
        "bg_gradient": ("#fff7ed", "#faf5ff"),
        "icon": "📢",
    },
    "threats": {
        "title": "Digital Intimidation & Threats",
        "sub": "Aggressive direct messages and coercive hostility",
        "primary": "#b91c1c",
        "secondary": "#475569",
        "bg_gradient": ("#fef2f2", "#f8fafc"),
        "icon": "⚠️",
    },
    "humiliating_content": {
        "title": "Humiliating Visual Media",
        "sub": "Candid photos and non-consensual viral recordings",
        "primary": "#9333ea",
        "secondary": "#db2777",
        "bg_gradient": ("#faf5ff", "#fdf2f8"),
        "icon": "📸",
    },
    "general": {
        "title": "Cyberbullying Awareness & Safety",
        "sub": "Promoting peer support, empathy, and active upstanding",
        "primary": "#2563eb",
        "secondary": "#059669",
        "bg_gradient": ("#eff6ff", "#ecfdf5"),
        "icon": "🛡️",
    },
}

def create_svg(theme: str, variant: int) -> str:
    meta = THEME_META[theme]
    p = meta["primary"]
    s = meta["secondary"]
    bg1, bg2 = meta["bg_gradient"]
    title = meta["title"]
    sub = meta["sub"]
    icon = meta["icon"]

    # Vary layout & compositions across variants
    # Variant 1: Smartphone & message flow center
    # Variant 2: Campus laptop / discussion forum setting
    # Variant 3: Social peer network / bystander tension view

    if variant == 1:
        # Mobile screen dominant with notification cards
        scene_art = f"""
        <!-- Phone Device Frame -->
        <rect x="290" y="80" width="220" height="350" rx="28" fill="#ffffff" stroke="{p}" stroke-width="4" filter="url(#shadow)"/>
        <rect x="305" y="115" width="190" height="275" rx="16" fill="{bg1}"/>
        <!-- Phone Speaker & Camera -->
        <line x1="375" y1="98" x2="425" y2="98" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
        <circle cx="360" cy="98" r="3.5" fill="#94a3b8"/>
        <!-- Incoming Alert Banner -->
        <rect x="320" y="135" width="160" height="48" rx="10" fill="#ffffff" stroke="{s}" stroke-width="2"/>
        <circle cx="340" cy="159" r="12" fill="{s}" fill-opacity="0.2"/>
        <text x="340" y="164" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" fill="{s}">!</text>
        <rect x="360" y="148" width="105" height="8" rx="4" fill="{p}"/>
        <rect x="360" y="162" width="75" height="6" rx="3" fill="#94a3b8"/>
        <!-- Message Bubbles -->
        <rect x="320" y="198" width="130" height="36" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="330" y="210" width="90" height="6" rx="3" fill="#64748b"/>
        <rect x="330" y="220" width="60" height="6" rx="3" fill="#94a3b8"/>
        
        <rect x="350" y="248" width="130" height="42" rx="12" fill="{p}" fill-opacity="0.12" stroke="{p}" stroke-width="1.5"/>
        <rect x="362" y="260" width="100" height="6" rx="3" fill="{p}"/>
        <rect x="362" y="272" width="70" height="6" rx="3" fill="{p}" fill-opacity="0.7"/>

        <rect x="320" y="304" width="145" height="40" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="330" y="316" width="110" height="6" rx="3" fill="#64748b"/>
        <rect x="330" y="328" width="80" height="6" rx="3" fill="#94a3b8"/>

        <!-- Ambient Side Floating Reaction Icons -->
        <g filter="url(#glow)">
          <circle cx="210" cy="180" r="32" fill="#ffffff" stroke="{p}" stroke-width="2.5"/>
          <text x="210" y="188" font-family="system-ui, sans-serif" font-size="22" text-anchor="middle">{icon}</text>

          <circle cx="590" cy="220" r="28" fill="#ffffff" stroke="{s}" stroke-width="2.5"/>
          <text x="590" y="228" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">💬</text>

          <circle cx="230" cy="320" r="24" fill="#ffffff" stroke="{p}" stroke-width="2"/>
          <text x="230" y="328" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">⚠️</text>

          <circle cx="570" cy="340" r="26" fill="#ffffff" stroke="{s}" stroke-width="2"/>
          <text x="570" y="347" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">📱</text>
        </g>
        """
    elif variant == 2:
        # Laptop / Workspace / Forum view
        scene_art = f"""
        <!-- Laptop Device -->
        <rect x="230" y="140" width="340" height="210" rx="14" fill="#ffffff" stroke="{p}" stroke-width="4" filter="url(#shadow)"/>
        <rect x="245" y="155" width="310" height="180" rx="8" fill="{bg1}"/>
        <!-- Laptop Base -->
        <path d="M190 350 L610 350 L585 368 L215 368 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
        <rect x="365" y="352" width="70" height="5" rx="2.5" fill="#94a3b8"/>

        <!-- Laptop Screen Header Bar -->
        <rect x="245" y="155" width="310" height="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
        <circle cx="260" cy="169" r="4" fill="#ef4444"/>
        <circle cx="272" cy="169" r="4" fill="#f59e0b"/>
        <circle cx="284" cy="169" r="4" fill="#10b981"/>
        <rect x="305" y="163" width="190" height="12" rx="6" fill="#f1f5f9"/>

        <!-- Forum / Portal Thread Cards -->
        <rect x="260" y="195" width="280" height="42" rx="8" fill="#ffffff" stroke="{p}" stroke-width="1.5"/>
        <circle cx="278" cy="216" r="10" fill="{p}" fill-opacity="0.2"/>
        <rect x="296" y="208" width="130" height="7" rx="3.5" fill="{p}"/>
        <rect x="296" y="220" width="200" height="5" rx="2.5" fill="#94a3b8"/>

        <rect x="260" y="246" width="280" height="42" rx="8" fill="#ffffff" stroke="{s}" stroke-width="1.5"/>
        <circle cx="278" cy="267" r="10" fill="{s}" fill-opacity="0.2"/>
        <rect x="296" y="259" width="150" height="7" rx="3.5" fill="{s}"/>
        <rect x="296" y="271" width="180" height="5" rx="2.5" fill="#94a3b8"/>

        <rect x="260" y="297" width="280" height="30" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
        <rect x="278" y="309" width="180" height="6" rx="3" fill="#cbd5e1"/>

        <!-- Side Emblems -->
        <g filter="url(#glow)">
          <circle cx="150" cy="240" r="34" fill="#ffffff" stroke="{p}" stroke-width="2.5"/>
          <text x="150" y="250" font-family="system-ui, sans-serif" font-size="24" text-anchor="middle">{icon}</text>

          <circle cx="650" cy="240" r="34" fill="#ffffff" stroke="{s}" stroke-width="2.5"/>
          <text x="650" y="249" font-family="system-ui, sans-serif" font-size="22" text-anchor="middle">💻</text>
        </g>
        """
    else:
        # Multi-peer social / network dialogue composition
        scene_art = f"""
        <!-- Central Community / Chat Portal Frame -->
        <rect x="200" y="110" width="400" height="280" rx="24" fill="#ffffff" stroke="{p}" stroke-width="3" filter="url(#shadow)"/>
        <!-- Window Bar -->
        <path d="M200 134 Q200 110 224 110 L576 110 Q600 110 600 134 L600 148 L200 148 Z" fill="{p}"/>
        <circle cx="225" cy="129" r="4.5" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="240" cy="129" r="4.5" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="255" cy="129" r="4.5" fill="#ffffff" fill-opacity="0.7"/>
        <text x="400" y="134" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="#ffffff" letter-spacing="1">CAMPUS DIGITAL NETWORK</text>

        <!-- Network User Nodes -->
        <circle cx="270" cy="210" r="28" fill="{bg1}" stroke="{p}" stroke-width="2.5"/>
        <text x="270" y="218" font-family="system-ui, sans-serif" font-size="20" text-anchor="middle">👤</text>
        
        <circle cx="530" cy="210" r="28" fill="{bg2}" stroke="{s}" stroke-width="2.5"/>
        <text x="530" y="218" font-family="system-ui, sans-serif" font-size="20" text-anchor="middle">👥</text>

        <!-- Connecting Data Wave -->
        <path d="M305 210 Q400 170 495 210" fill="none" stroke="{p}" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="400" cy="190" r="16" fill="{s}" fill-opacity="0.15" stroke="{s}" stroke-width="2"/>
        <text x="400" y="196" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">{icon}</text>

        <!-- Dynamic Discussion Thread in Lower Center -->
        <rect x="235" y="260" width="330" height="50" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="255" cy="285" r="10" fill="{p}" fill-opacity="0.25"/>
        <rect x="274" y="278" width="180" height="7" rx="3.5" fill="{p}"/>
        <rect x="274" y="291" width="120" height="5" rx="2.5" fill="#94a3b8"/>

        <rect x="235" y="322" width="330" height="48" rx="12" fill="#ffffff" stroke="{s}" stroke-width="1.5"/>
        <circle cx="255" cy="346" r="10" fill="{s}" fill-opacity="0.25"/>
        <rect x="274" y="339" width="160" height="7" rx="3.5" fill="{s}"/>
        <rect x="274" y="352" width="220" height="5" rx="2.5" fill="#94a3b8"/>

        <!-- External Atmospheric Badges -->
        <circle cx="110" cy="250" r="32" fill="#ffffff" stroke="{p}" stroke-width="2" filter="url(#glow)"/>
        <text x="110" y="259" font-family="system-ui, sans-serif" font-size="22" text-anchor="middle">🌐</text>

        <circle cx="690" cy="250" r="32" fill="#ffffff" stroke="{s}" stroke-width="2" filter="url(#glow)"/>
        <text x="690" y="259" font-family="system-ui, sans-serif" font-size="22" text-anchor="middle">{icon}</text>
        """

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{p}"/>
      <stop offset="100%" stop-color="{s}"/>
    </linearGradient>
    <filter id="shadow" x="-8%" y="-8%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="{p}" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="500" rx="20" fill="url(#bgGrad)"/>

  <!-- Decorative Background Grid Lines -->
  <g stroke="#cbd5e1" stroke-width="1" stroke-opacity="0.35" stroke-dasharray="4,6">
    <line x1="60" y1="0" x2="60" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="500"/>
    <line x1="600" y1="0" x2="600" y2="500"/>
    <line x1="740" y1="0" x2="740" y2="500"/>
    <line x1="0" y1="80" x2="800" y2="800"/>
    <line x1="0" y1="420" x2="800" y2="420"/>
  </g>

  <!-- Top Theme Header Pill -->
  <g transform="translate(50, 32)">
    <rect x="0" y="0" width="310" height="42" rx="21" fill="#ffffff" stroke="{p}" stroke-width="1.5" filter="url(#shadow)"/>
    <circle cx="22" cy="21" r="14" fill="{p}" fill-opacity="0.12"/>
    <text x="22" y="26" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">{icon}</text>
    <text x="46" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="{p}">{title}</text>
  </g>

  <!-- Top Right Scenario Context Tag -->
  <g transform="translate(580, 36)">
    <rect x="0" y="0" width="170" height="34" rx="17" fill="#ffffff" stroke="{s}" stroke-width="1.5"/>
    <circle cx="16" cy="17" r="6" fill="{s}"/>
    <text x="32" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#334155">Variant {variant} of 3</text>
  </g>

  <!-- Central Visual Scene Art -->
  {scene_art}

  <!-- Bottom Educational Insight Caption Bar -->
  <g transform="translate(100, 435)">
    <rect x="0" y="0" width="600" height="38" rx="12" fill="#ffffff" fill-opacity="0.9" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
    <rect x="12" y="10" width="5" height="18" rx="2.5" fill="url(#accentGrad)"/>
    <text x="28" y="24" font-family="system-ui, sans-serif" font-size="12.5" font-weight="600" fill="#475569">
      Theme Focus: {sub}
    </text>
  </g>
</svg>"""
    return svg.strip()

def main():
    count = 0
    for theme in THEME_META:
        theme_dir = BASE_DIR / theme
        theme_dir.mkdir(parents=True, exist_ok=True)
        for variant in (1, 2, 3):
            file_path = theme_dir / f"variant_{variant}.svg"
            svg_content = create_svg(theme, variant)
            file_path.write_text(svg_content, encoding="utf-8")
            count += 1
            print(f"Generated: {file_path.relative_to(Path(__file__).parent)}")

    print(f"\nSuccessfully generated {count} theme fallback images across {len(THEME_META)} themes!")

if __name__ == "__main__":
    main()

