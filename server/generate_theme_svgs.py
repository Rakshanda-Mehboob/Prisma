"""
server/generate_theme_svgs.py

Generates 42 completely unique, high-quality vector SVG illustrations:
- 7 themes: mockery, exclusion, private_info_leak, false_rumour, threats, humiliating_content, general
- 6 visually distinct scenes per theme (42 distinct illustrations total)
- Differ in composition, characters, objects, gestures, architectural setting, and layouts
- 100% well-formed, strict XML with all reserved entities escaped (&amp;)
"""

import html
import xml.etree.ElementTree as ET
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent / "static" / "scenario_images" / "themes"

def escape_xml_text(s: str) -> str:
    """Properly escapes reserved XML characters (&, <, >, quotes)."""
    s = html.unescape(s)
    return html.escape(s, quote=True)

def build_svg_document(theme_title: str, scene_title: str, variant_num: int, p_color: str, s_color: str, bg1: str, bg2: str, scene_elements: str) -> str:
    """Wraps scene elements into a complete, well-formed 800x500 SVG document."""
    escaped_theme = escape_xml_text(theme_title)
    escaped_scene = escape_xml_text(scene_title)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{p_color}"/>
      <stop offset="100%" stop-color="{s_color}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <filter id="cardShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
    <filter id="softGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="{p_color}" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Environment Canvas Background -->
  <rect width="800" height="500" rx="16" fill="url(#bgGrad)"/>

  <!-- Top Header Scene Pill -->
  <g transform="translate(40, 24)">
    <rect x="0" y="0" width="360" height="38" rx="19" fill="#ffffff" stroke="{p_color}" stroke-width="1.5" filter="url(#shadow)"/>
    <circle cx="20" cy="19" r="11" fill="{p_color}" fill-opacity="0.14"/>
    <circle cx="20" cy="19" r="4.5" fill="{p_color}"/>
    <text x="40" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="800" fill="{p_color}">{escaped_theme}</text>
  </g>

  <!-- Top Right Variant Counter Badge -->
  <g transform="translate(630, 26)">
    <rect x="0" y="0" width="130" height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadow)"/>
    <circle cx="18" cy="17" r="5" fill="{s_color}"/>
    <text x="32" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#475569">Scene {variant_num} of 6</text>
  </g>

  <!-- Core Scene Illustration Graphics -->
  {scene_elements}

  <!-- Bottom Context Banner -->
  <g transform="translate(50, 440)">
    <rect x="0" y="0" width="700" height="36" rx="10" fill="#ffffff" fill-opacity="0.95" stroke="#e2e8f0" stroke-width="1.2" filter="url(#shadow)"/>
    <rect x="12" y="9" width="4.5" height="18" rx="2" fill="url(#accentGrad)"/>
    <text x="26" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#334155">
      Scenario Illustration: {escaped_scene}
    </text>
  </g>
</svg>"""

# ==============================================================================
# THEME 1: MOCKERY (6 Distinct Scenes)
# ==============================================================================

def get_mockery_scene(variant: int) -> tuple:
    """Returns (scene_title, scene_svg_markup, primary, secondary, bg1, bg2)"""
    p, s = "#4f46e5", "#ec4899"
    bg1, bg2 = "#f5f3ff", "#fdf2f8"

    if variant == 1:
        # Scene 1: Presentation Podium & Recording Phone Crowd
        title = "Presentation Ridicule in Lecture Theater"
        art = f"""
        <!-- Background Lecture Screen -->
        <rect x="250" y="80" width="300" height="150" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="270" y="98" width="140" height="12" rx="4" fill="{p}"/>
        <rect x="270" y="120" width="220" height="7" rx="3" fill="#94a3b8"/>
        <rect x="270" y="134" width="180" height="7" rx="3" fill="#cbd5e1"/>
        <line x1="270" y1="160" x2="490" y2="160" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="450" cy="185" r="18" fill="{s}" fill-opacity="0.15"/>
        <path d="M440 185 L447 192 L460 178" stroke="{s}" stroke-width="2.5" fill="none"/>

        <!-- Stage Floor Platform -->
        <path d="M60 380 L740 380 L680 430 L120 430 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>

        <!-- Presentation Podium -->
        <rect x="360" y="230" width="80" height="150" rx="6" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <line x1="395" y1="230" x2="385" y2="200" stroke="#94a3b8" stroke-width="3"/>
        <circle cx="383" cy="198" r="5" fill="#64748b"/>

        <!-- Distressed Presenter Behind Podium -->
        <circle cx="400" cy="165" r="24" fill="#fed7aa"/>
        <path d="M380 155 Q400 145 420 155 Q415 142 390 142 Z" fill="#334155"/>
        <!-- Anxious expression / hand to face -->
        <path d="M370 200 L390 175" stroke="#fed7aa" stroke-width="8" stroke-linecap="round"/>
        <rect x="375" y="189" width="50" height="55" rx="10" fill="{p}"/>

        <!-- Foreground Laughing Audience Phones -->
        <!-- Left phone recording -->
        <g transform="translate(140, 260)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="80" height="130" rx="12" fill="#0f172a" stroke="{s}" stroke-width="2"/>
          <rect x="6" y="12" width="68" height="96" rx="6" fill="#1e293b"/>
          <circle cx="40" cy="30" r="14" fill="{s}" fill-opacity="0.3"/>
          <circle cx="60" cy="20" r="4" fill="#ef4444"/>
          <text x="40" y="65" font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle">REC 00:14</text>
          <text x="40" y="85" font-family="sans-serif" font-size="16" text-anchor="middle">😂</text>
        </g>
        <!-- Mocking speech bubble from crowd -->
        <path d="M230 260 Q260 230 290 250 L270 270 Z" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="260" y="255" font-family="sans-serif" font-size="12" font-weight="700" fill="{s}">LOL listen to this!</text>

        <!-- Right phone recording -->
        <g transform="translate(580, 260)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="80" height="130" rx="12" fill="#0f172a" stroke="{p}" stroke-width="2"/>
          <rect x="6" y="12" width="68" height="96" rx="6" fill="#1e293b"/>
          <text x="40" y="60" font-family="sans-serif" font-size="18" text-anchor="middle">🤡</text>
          <circle cx="60" cy="20" r="4" fill="#ef4444"/>
          <text x="40" y="90" font-family="sans-serif" font-size="9" fill="#f87171" text-anchor="middle">Posting live...</text>
        </g>
        """
    elif variant == 2:
        # Scene 2: Code Review IDE Flaming
        title = "Code Review Sarcasm and Public Flaming"
        art = f"""
        <!-- Large Desktop Workspace Monitor -->
        <rect x="180" y="80" width="440" height="270" rx="14" fill="#1e293b" stroke="#334155" stroke-width="4" filter="url(#cardShadow)"/>
        <!-- Monitor Stand -->
        <path d="M370 350 L430 350 L440 390 L360 390 Z" fill="#64748b"/>
        <rect x="330" y="390" width="140" height="10" rx="4" fill="#475569"/>

        <!-- IDE Editor Top Tabs -->
        <rect x="182" y="82" width="436" height="30" fill="#0f172a" rx="10 10 0 0"/>
        <circle cx="205" cy="97" r="4" fill="#ef4444"/>
        <circle cx="218" cy="97" r="4" fill="#f59e0b"/>
        <circle cx="231" cy="97" r="4" fill="#10b981"/>
        <rect x="250" y="88" width="100" height="18" rx="4" fill="#1e293b"/>
        <text x="260" y="101" font-family="monospace" font-size="10" fill="#94a3b8">sprint_repo.js</text>

        <!-- IDE Code Lines -->
        <g transform="translate(200, 125)">
          <text x="0" y="14" font-family="monospace" font-size="11" fill="#60a5fa">function</text>
          <text x="65" y="14" font-family="monospace" font-size="11" fill="#fbbf24">calculateMetrics()</text>
          <text x="195" y="14" font-family="monospace" font-size="11" fill="#cbd5e1">{{</text>
          
          <rect x="0" y="24" width="220" height="18" fill="rgba(239, 68, 68, 0.2)"/>
          <text x="15" y="37" font-family="monospace" font-size="10" fill="#f87171">- return data.filter(x =&gt; x.valid);</text>
          
          <text x="15" y="58" font-family="monospace" font-size="10" fill="#cbd5e1">const res = computeTotals();</text>
          <text x="0" y="78" font-family="monospace" font-size="11" fill="#cbd5e1">}}</text>
        </g>

        <!-- Sarcastic Review Comment Bubble 1 -->
        <g transform="translate(340, 150)" filter="url(#softGlow)">
          <rect x="0" y="0" width="260" height="70" rx="8" fill="#ffffff" stroke="{s}" stroke-width="2"/>
          <circle cx="20" cy="22" r="12" fill="{s}" fill-opacity="0.18"/>
          <text x="20" y="27" font-family="sans-serif" font-size="12" text-anchor="middle">🤡</text>
          <text x="40" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="{s}">Hamza (Batch CR):</text>
          <text x="40" y="42" font-family="sans-serif" font-size="10.5" fill="#334155">"Did you code this with your eyes closed?</text>
          <text x="40" y="56" font-family="sans-serif" font-size="10" fill="#64748b">Who approved this PR? Tagging everyone 😂"</text>
        </g>

        <!-- Sarcastic Comment 2 (Reactions Counter) -->
        <g transform="translate(360, 230)">
          <rect x="0" y="0" width="180" height="34" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
          <text x="12" y="22" font-family="sans-serif" font-size="11">😆 14</text>
          <text x="60" y="22" font-family="sans-serif" font-size="11">💀 8</text>
          <text x="105" y="22" font-family="sans-serif" font-size="11">👎 12</text>
        </g>

        <!-- Distressed Student Silhouette Beside Desk -->
        <g transform="translate(80, 240)">
          <circle cx="50" cy="40" r="26" fill="#fed7aa"/>
          <path d="M30 30 Q50 15 70 30 Z" fill="#1e293b"/>
          <path d="M10 110 Q50 65 90 110 Z" fill="{p}"/>
          <!-- Head in hands -->
          <circle cx="28" cy="45" r="7" fill="#fed7aa"/>
          <circle cx="72" cy="45" r="7" fill="#fed7aa"/>
        </g>
        """
    elif variant == 3:
        # Scene 3: Smartphone Batch Ridicule & Sticker Flurry
        title = "Viral Sticker Bombardment in Class Batch Chat"
        art = f"""
        <!-- Large Center Phone Isometric -->
        <g transform="translate(260, 75)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="280" height="340" rx="26" fill="#ffffff" stroke="{p}" stroke-width="4"/>
          <!-- Chat Header Bar -->
          <rect x="0" y="0" width="280" height="55" rx="26 26 0 0" fill="{p}"/>
          <circle cx="28" cy="28" r="14" fill="#ffffff" fill-opacity="0.3"/>
          <text x="28" y="33" font-family="sans-serif" font-size="13" fill="#ffffff" text-anchor="middle">👥</text>
          <text x="52" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">University Batch (185)</text>
          <text x="52" y="42" font-family="sans-serif" font-size="9.5" fill="#e0e7ff">14 typing...</text>

          <!-- Chat Stream Mocking Target -->
          <rect x="15" y="70" width="210" height="48" rx="10" fill="#f1f5f9"/>
          <text x="25" y="88" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{p}">Bilal:</text>
          <text x="25" y="104" font-family="sans-serif" font-size="10" fill="#334155">"Look at the meme sticker of Zainab! 🤣"</text>

          <!-- The Mocking Sticker Bubble -->
          <rect x="40" y="130" width="190" height="95" rx="12" fill="#fdf2f8" stroke="{s}" stroke-width="1.8"/>
          <circle cx="85" cy="175" r="28" fill="#fed7aa" stroke="{s}" stroke-width="2"/>
          <text x="85" y="182" font-family="sans-serif" font-size="20" text-anchor="middle">😵</text>
          <rect x="125" y="150" width="90" height="12" rx="3" fill="{s}"/>
          <text x="170" y="160" font-family="sans-serif" font-size="9" fill="#ffffff" text-anchor="middle" font-weight="700">DUMB MOMENT</text>
          <text x="130" y="180" font-family="sans-serif" font-size="9.5" fill="#64748b">Shared 42 times</text>

          <!-- Reply Flood Below -->
          <rect x="15" y="240" width="180" height="38" rx="8" fill="#f1f5f9"/>
          <text x="25" y="256" font-family="sans-serif" font-size="10" font-weight="700" fill="#0891b2">Taimoor:</text>
          <text x="25" y="270" font-family="sans-serif" font-size="10" fill="#475569">"Bruh I'm dead, forward to group 2"</text>
        </g>

        <!-- Floating Laughing Emoji Balloons -->
        <circle cx="160" cy="160" r="32" fill="#ffffff" stroke="{s}" stroke-width="2" filter="url(#shadow)"/>
        <text x="160" y="170" font-family="sans-serif" font-size="26" text-anchor="middle">🤣</text>

        <circle cx="640" cy="180" r="30" fill="#ffffff" stroke="{p}" stroke-width="2" filter="url(#shadow)"/>
        <text x="640" y="190" font-family="sans-serif" font-size="24" text-anchor="middle">💀</text>

        <circle cx="620" cy="290" r="26" fill="#ffffff" stroke="{s}" stroke-width="2" filter="url(#shadow)"/>
        <text x="620" y="298" font-family="sans-serif" font-size="20" text-anchor="middle">📸</text>
        """
    elif variant == 4:
        # Scene 4: Engineering Hardware Lab Prototype Mock
        title = "Hardware Lab Demonstration Failure Mockery"
        art = f"""
        <!-- Lab Bench Table -->
        <rect x="120" y="260" width="560" height="20" rx="4" fill="#475569"/>
        <rect x="150" y="280" width="30" height="120" fill="#64748b"/>
        <rect x="620" y="280" width="30" height="120" fill="#64748b"/>

        <!-- Oscilloscope / Measurement Machine on Table -->
        <rect x="170" y="170" width="120" height="90" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
        <rect x="180" y="180" width="70" height="50" rx="4" fill="#022c22"/>
        <path d="M185 205 L200 205 L210 190 L220 220 L230 205 L245 205" fill="none" stroke="#22c55e" stroke-width="2"/>
        <circle cx="270" cy="195" r="7" fill="#64748b"/>
        <circle cx="270" cy="215" r="7" fill="#64748b"/>

        <!-- Smoking Breadboard Circuit -->
        <rect x="330" y="235" width="130" height="25" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="360" cy="247" r="4" fill="#ef4444"/>
        <circle cx="390" cy="247" r="4" fill="#3b82f6"/>
        <path d="M355 230 Q350 200 365 180 Q355 160 370 140" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
        <text x="390" y="195" font-family="sans-serif" font-size="11" font-weight="700" fill="#ef4444">BURNED OUT!</text>

        <!-- Mocking Partner 1 Pointing & Laughing -->
        <g transform="translate(480, 140)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M15 20 Q30 8 45 20 Z" fill="#334155"/>
          <rect x="10" y="52" width="40" height="70" rx="8" fill="{s}"/>
          <!-- Pointing Arm Extended -->
          <line x1="10" y1="70" x2="-35" y2="90" stroke="#fed7aa" stroke-width="8" stroke-linecap="round"/>
          <circle cx="-37" cy="90" r="4" fill="#fed7aa"/>
          <!-- Laughing face text bubble -->
          <rect x="35" y="-10" width="75" height="30" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
          <text x="72" y="10" font-family="sans-serif" font-size="11" text-anchor="middle" font-weight="700" fill="{s}">"Clueless! 😂"</text>
        </g>

        <!-- Humiliated Target Student Looking Away -->
        <g transform="translate(60, 160)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M10 25 Q30 10 50 25 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="80" rx="8" fill="{p}"/>
          <!-- Head facing down -->
          <path d="M30 45 L30 55" stroke="#fed7aa" stroke-width="6"/>
        </g>
        """
    elif variant == 5:
        # Scene 5: Public Derogatory Poll on Campus App
        title = "Public Humiliation via Anonymous Campus Poll"
        art = f"""
        <!-- Large Stylized Tablet Screen -->
        <rect x="220" y="80" width="360" height="290" rx="18" fill="#ffffff" stroke="{p}" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Poll Header Bar -->
        <rect x="240" y="105" width="320" height="42" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1.5"/>
        <text x="255" y="125" font-family="sans-serif" font-size="11" font-weight="800" fill="#b91c1c">⚠️ CAMPUS CONFESSION POLL</text>
        <text x="255" y="140" font-family="sans-serif" font-size="10" fill="#7f1d1d">"Who is the most difficult student to work with in Section C?"</text>

        <!-- Poll Option 1 (Target Student singled out with 82% bar) -->
        <g transform="translate(240, 160)">
          <rect x="0" y="0" width="320" height="45" rx="6" fill="#f8fafc" stroke="{s}" stroke-width="1.8"/>
          <rect x="0" y="0" width="260" height="45" rx="6" fill="{s}" fill-opacity="0.18"/>
          <text x="14" y="27" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a">Arooj M. (82% votes)</text>
          <text x="270" y="27" font-family="sans-serif" font-size="13" font-weight="800" fill="{s}">214</text>
        </g>

        <!-- Poll Option 2 & 3 (Low bars) -->
        <g transform="translate(240, 215)">
          <rect x="0" y="0" width="320" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <rect x="0" y="0" width="40" height="32" rx="6" fill="#cbd5e1" fill-opacity="0.5"/>
          <text x="14" y="20" font-family="sans-serif" font-size="10" fill="#64748b">Student B (10% votes)</text>
        </g>
        <g transform="translate(240, 255)">
          <rect x="0" y="0" width="320" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <rect x="0" y="0" width="25" height="32" rx="6" fill="#cbd5e1" fill-opacity="0.5"/>
          <text x="14" y="20" font-family="sans-serif" font-size="10" fill="#64748b">Student C (8% votes)</text>
        </g>

        <!-- Voting Count Footer -->
        <text x="400" y="315" font-family="sans-serif" font-size="10.5" fill="#94a3b8" text-anchor="middle">261 students participated • 1 hour ago</text>

        <!-- Side Emoticons -->
        <circle cx="130" cy="220" r="30" fill="#ffffff" stroke="{s}" stroke-width="2" filter="url(#shadow)"/>
        <text x="130" y="230" font-family="sans-serif" font-size="22" text-anchor="middle">📊</text>

        <circle cx="670" cy="220" r="30" fill="#ffffff" stroke="{p}" stroke-width="2" filter="url(#shadow)"/>
        <text x="670" y="230" font-family="sans-serif" font-size="22" text-anchor="middle">👀</text>
        """
    else:
        # Scene 6: Cafeteria Mess Table Mimicry & Shaming
        title = "Public Mimicry in Campus Dining Hall"
        art = f"""
        <!-- Dining Hall Long Tables -->
        <path d="M80 340 L720 340 L660 380 L140 380 Z" fill="#cbd5e1"/>
        <rect x="140" y="380" width="20" height="50" fill="#94a3b8"/>
        <rect x="640" y="380" width="20" height="50" fill="#94a3b8"/>

        <!-- Trays & Canteen Glasses on Table -->
        <rect x="220" y="325" width="60" height="20" rx="3" fill="#94a3b8"/>
        <circle cx="235" cy="335" r="5" fill="#f59e0b"/>
        <rect x="420" y="325" width="60" height="20" rx="3" fill="#94a3b8"/>

        <!-- Aggressor Standing Up on Bench Mimicking Target -->
        <g transform="translate(340, 120)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 6 48 20 Z" fill="#1e293b"/>
          <!-- Mocking animated gesture with elbows outward -->
          <rect x="10" y="52" width="40" height="85" rx="8" fill="{s}"/>
          <path d="M10 70 L-20 60 L-10 40" stroke="#fed7aa" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M50 70 L80 60 L70 40" stroke="#fed7aa" stroke-width="7" stroke-linecap="round" fill="none"/>
          <!-- Big laugh bubble -->
          <rect x="-40" y="-30" width="140" height="34" rx="10" fill="#ffffff" stroke="{s}" stroke-width="1.8"/>
          <text x="30" y="-8" font-family="sans-serif" font-size="11" font-weight="700" fill="{s}" text-anchor="middle">"Watch her walk! 😂"</text>
        </g>

        <!-- Laughing Peers at Table -->
        <circle cx="230" cy="270" r="18" fill="#fed7aa"/>
        <rect x="215" y="288" width="30" height="40" rx="6" fill="#64748b"/>
        <circle cx="490" cy="270" r="18" fill="#fed7aa"/>
        <rect x="475" y="288" width="30" height="40" rx="6" fill="#64748b"/>

        <!-- Target Student Isolated in Foreground Corner -->
        <g transform="translate(640, 240)" filter="url(#shadow)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <path d="M10 18 Q25 8 40 18 Z" fill="#0f172a"/>
          <rect x="8" y="45" width="34" height="60" rx="6" fill="{p}"/>
          <!-- Clutching tray, head low -->
          <rect x="-10" y="70" width="35" height="15" rx="2" fill="#e2e8f0"/>
        </g>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 2: EXCLUSION (6 Distinct Scenes)
# ==============================================================================

def get_exclusion_scene(variant: int) -> tuple:
    p, s = "#0891b2", "#64748b"
    bg1, bg2 = "#ecfeff", "#f1f5f9"

    if variant == 1:
        # Scene 1: Library Circular Table with Empty Pushed-Back Chair
        title = "Study Circle Deliberate Ostracization"
        art = f"""
        <!-- Background Library Bookshelf -->
        <rect x="80" y="80" width="640" height="90" rx="6" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <g fill="#94a3b8">
          <rect x="100" y="90" width="18" height="70" rx="2" fill="#0284c7"/>
          <rect x="122" y="95" width="22" height="65" rx="2" fill="#f59e0b"/>
          <rect x="148" y="90" width="16" height="70" rx="2" fill="#10b981"/>
          <rect x="168" y="98" width="24" height="62" rx="2" fill="#ec4899"/>
          <rect x="250" y="90" width="20" height="70" rx="2" fill="#6366f1"/>
          <rect x="274" y="92" width="18" height="68" rx="2" fill="#14b8a6"/>
        </g>

        <!-- Round Collaborative Study Table -->
        <ellipse cx="360" cy="290" rx="140" ry="60" fill="#ffffff" stroke="{p}" stroke-width="3" filter="url(#cardShadow)"/>
        <rect x="330" y="270" width="60" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
        <line x1="340" y1="280" x2="380" y2="280" stroke="{p}" stroke-width="2"/>

        <!-- 3 Students Huddled Closely on the Left Side of Table -->
        <circle cx="280" cy="240" r="18" fill="#fed7aa"/>
        <rect x="265" y="258" width="30" height="40" rx="6" fill="{p}"/>

        <circle cx="340" cy="220" r="18" fill="#fed7aa"/>
        <rect x="325" y="238" width="30" height="40" rx="6" fill="{s}"/>

        <circle cx="400" cy="240" r="18" fill="#fed7aa"/>
        <rect x="385" y="258" width="30" height="40" rx="6" fill="{p}"/>

        <!-- PUSHED AWAY Empty Chair on the Right -->
        <path d="M470 310 L510 310 L505 370 L475 370 Z" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
        <text x="490" y="345" font-family="sans-serif" font-size="11" font-weight="700" fill="#dc2626" text-anchor="middle">NO SEAT</text>

        <!-- Excluded Student Standing in Aisle with Backpack -->
        <g transform="translate(600, 180)" filter="url(#shadow)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="85" rx="8" fill="#475569"/>
          <!-- Backpack strap -->
          <line x1="14" y1="55" x2="14" y2="110" stroke="#0284c7" stroke-width="5"/>
          <!-- Folder clutched -->
          <rect x="25" y="75" width="30" height="40" rx="3" fill="#f59e0b"/>
          <!-- Dialogue bubble above: left out -->
          <rect x="-80" y="-30" width="130" height="32" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
          <text x="-15" y="-10" font-family="sans-serif" font-size="10.5" fill="#64748b" text-anchor="middle">"Is this seat taken?"</text>
        </g>
        """
    elif variant == 2:
        # Scene 2: Discord Server Channel Kick / Permission Denied
        title = "Removal and Blacklisting from Project Discord"
        art = f"""
        <!-- Discord UI Dark Mode Monitor -->
        <rect x="180" y="80" width="440" height="280" rx="14" fill="#313338" stroke="#1e1f22" stroke-width="4" filter="url(#cardShadow)"/>
        
        <!-- Left Server Sidebar Icons -->
        <rect x="180" y="80" width="55" height="280" fill="#1e1f22" rx="14 0 0 14"/>
        <circle cx="207" cy="115" r="16" fill="{p}"/>
        <text x="207" y="120" font-family="sans-serif" font-size="11" fill="#ffffff" text-anchor="middle">SE</text>
        <circle cx="207" cy="160" r="14" fill="#2b2d31"/>
        <circle cx="207" cy="200" r="14" fill="#2b2d31"/>

        <!-- Channel List -->
        <rect x="235" y="80" width="120" height="280" fill="#2b2d31"/>
        <text x="248" y="110" font-family="sans-serif" font-size="11" font-weight="700" fill="#949ba4">TEXT CHANNELS</text>
        <text x="248" y="135" font-family="sans-serif" font-size="11" fill="#dbdee1"># announcements</text>
        <rect x="242" y="150" width="105" height="26" rx="4" fill="rgba(239, 68, 68, 0.2)"/>
        <text x="248" y="167" font-family="sans-serif" font-size="11" fill="#f87171">🔒 #final-project</text>
        <text x="248" y="195" font-family="sans-serif" font-size="11" fill="#949ba4"># resources</text>

        <!-- Center Warning Modal (Access Denied) -->
        <g transform="translate(380, 130)" filter="url(#shadow)">
          <rect x="0" y="0" width="220" height="150" rx="10" fill="#2b2d31" stroke="#ef4444" stroke-width="2"/>
          <circle cx="110" cy="40" r="22" fill="#ef4444" fill-opacity="0.18"/>
          <text x="110" y="47" font-family="sans-serif" font-size="20" text-anchor="middle">🚫</text>
          <text x="110" y="82" font-family="sans-serif" font-size="12" font-weight="800" fill="#ef4444" text-anchor="middle">ACCESS REMOVED</text>
          <text x="110" y="102" font-family="sans-serif" font-size="10" fill="#dbdee1" text-anchor="middle">You were kicked from this server</text>
          <text x="110" y="118" font-family="sans-serif" font-size="9" fill="#949ba4" text-anchor="middle">by Moderator @Shahmeer</text>
        </g>

        <!-- Headphones resting abandoned on desk -->
        <path d="M110 330 A 30 30 0 0 1 170 330" fill="none" stroke="{s}" stroke-width="5"/>
        <rect x="100" y="325" width="16" height="25" rx="4" fill="#334155"/>
        <rect x="165" y="325" width="16" height="25" rx="4" fill="#334155"/>
        """
    elif variant == 3:
        # Scene 3: Google Doc Ghosting (Ignored Comments)
        title = "Ghosting and Deliberate Non-Response on Shared Document"
        art = f"""
        <!-- Laptop Display with Document -->
        <rect x="170" y="80" width="460" height="280" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Doc Header -->
        <rect x="170" y="80" width="460" height="36" fill="#f8fafc" stroke="#e2e8f0" rx="10 10 0 0"/>
        <rect x="190" y="92" width="16" height="16" rx="2" fill="{p}"/>
        <text x="215" y="104" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#334155">Term_Project_Submission_v4.docx</text>
        
        <!-- Document Text Area Left Side -->
        <g transform="translate(195, 135)" fill="#94a3b8">
          <rect x="0" y="0" width="220" height="10" rx="2" fill="{p}"/>
          <rect x="0" y="18" width="240" height="6" rx="2"/>
          <rect x="0" y="30" width="230" height="6" rx="2"/>
          <rect x="0" y="42" width="210" height="6" rx="2"/>
          <rect x="0" y="62" width="180" height="6" rx="2"/>
          <rect x="0" y="74" width="220" height="6" rx="2"/>
          <!-- Highlighted Text Section with Comment Marker -->
          <rect x="0" y="94" width="240" height="22" rx="3" fill="rgba(8, 145, 178, 0.15)"/>
          <text x="10" y="109" font-family="sans-serif" font-size="10" fill="{p}">Section 3.2: Methodology (Added by Sana)</text>
        </g>

        <!-- Right Side Comment Stream Showing Unanswered Queries -->
        <g transform="translate(460, 135)" filter="url(#shadow)">
          <rect x="0" y="0" width="155" height="95" rx="8" fill="#ffffff" stroke="{p}" stroke-width="1.8"/>
          <circle cx="16" cy="18" r="8" fill="{p}" fill-opacity="0.2"/>
          <text x="30" y="21" font-family="sans-serif" font-size="10" font-weight="700" fill="{p}">Sana (You):</text>
          <text x="10" y="40" font-family="sans-serif" font-size="9.5" fill="#334155">"Can anyone review</text>
          <text x="10" y="54" font-family="sans-serif" font-size="9.5" fill="#334155">this before tomorrow?"</text>
          <line x1="8" y1="65" x2="145" y2="65" stroke="#e2e8f0"/>
          <text x="10" y="80" font-family="sans-serif" font-size="8.5" fill="#94a3b8">Seen by 3 members • No reply</text>
        </g>

        <!-- Cold Coffee Mug on Side -->
        <rect x="100" y="270" width="35" height="45" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
        <path d="M135 280 C145 280 145 300 135 300" stroke="#94a3b8" stroke-width="2.5" fill="none"/>
        """
    elif variant == 4:
        # Scene 4: Commuter Point Bus Departure at Twilight
        title = "Commuter Isolation During Off-Hours Campus Events"
        art = f"""
        <!-- Twilight Sky Base with Lamp Posts -->
        <line x1="600" y1="120" x2="600" y2="350" stroke="#334155" stroke-width="4"/>
        <circle cx="600" cy="120" r="14" fill="#fef08a" fill-opacity="0.8"/>

        <!-- University Point Bus Silhouette -->
        <g transform="translate(100, 180)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="280" height="130" rx="16" fill="{s}" stroke="#334155" stroke-width="2"/>
          <!-- Bus Windows -->
          <rect x="20" y="25" width="45" height="40" rx="4" fill="#e2e8f0"/>
          <rect x="75" y="25" width="45" height="40" rx="4" fill="#e2e8f0"/>
          <rect x="130" y="25" width="45" height="40" rx="4" fill="#e2e8f0"/>
          <rect x="185" y="25" width="70" height="40" rx="4" fill="#bae6fd"/>
          <text x="220" y="18" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="700">CAMPUS BUS</text>
          <!-- Wheels -->
          <circle cx="65" cy="130" r="24" fill="#0f172a"/>
          <circle cx="65" cy="130" r="10" fill="#94a3b8"/>
          <circle cx="215" cy="130" r="24" fill="#0f172a"/>
          <circle cx="215" cy="130" r="10" fill="#94a3b8"/>
        </g>

        <!-- Solitary Commuter Student with Backpack Looking Back -->
        <g transform="translate(390, 210)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <path d="M10 18 Q25 8 40 18 Z" fill="#0f172a"/>
          <rect x="8" y="45" width="34" height="75" rx="6" fill="{p}"/>
          <!-- Backpack -->
          <rect x="-8" y="50" width="16" height="50" rx="4" fill="#0284c7"/>
          <!-- Umbrella in hand -->
          <line x1="42" y1="70" x2="42" y2="120" stroke="#475569" stroke-width="3"/>
        </g>

        <!-- Group of Hostel Peers Walking Away Together on the Right -->
        <g transform="translate(480, 230)">
          <circle cx="30" cy="20" r="15" fill="#fed7aa"/>
          <rect x="18" y="35" width="24" height="55" rx="5" fill="#10b981"/>
          <circle cx="65" cy="20" r="15" fill="#fed7aa"/>
          <rect x="53" y="35" width="24" height="55" rx="5" fill="#f59e0b"/>
          <!-- Speech Bubble: late night meetup -->
          <rect x="15" y="-30" width="95" height="24" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
          <text x="62" y="-14" font-family="sans-serif" font-size="9" fill="#334155" text-anchor="middle">"Meeting at 9 PM!"</text>
        </g>
        """
    elif variant == 5:
        # Scene 5: Department Society Roster Deletion
        title = "Deliberate Removal from Department Committee"
        art = f"""
        <!-- Society Office Whiteboard -->
        <rect x="180" y="80" width="440" height="260" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" filter="url(#cardShadow)"/>
        <text x="210" y="115" font-family="sans-serif" font-size="13" font-weight="800" fill="#0f172a">ANNUAL SYMPOSIUM COMMITTEE ROSTER</text>
        <line x1="210" y1="125" x2="590" y2="125" stroke="#e2e8f0" stroke-width="2"/>

        <!-- Team Lists -->
        <text x="210" y="150" font-family="sans-serif" font-size="11" font-weight="700" fill="{p}">Logistics Team:</text>
        <text x="220" y="170" font-family="sans-serif" font-size="10.5" fill="#475569">• Hamza K. (Lead)</text>
        <text x="220" y="188" font-family="sans-serif" font-size="10.5" fill="#475569">• Maryam A.</text>

        <text x="210" y="218" font-family="sans-serif" font-size="11" font-weight="700" fill="{s}">Media &amp; Outreach:</text>
        <!-- Strikethrough Removed Name -->
        <text x="220" y="238" font-family="sans-serif" font-size="10.5" fill="#ef4444" text-decoration="line-through">• Arham Tariq (REMOVED)</text>
        <line x1="220" y1="234" x2="350" y2="234" stroke="#ef4444" stroke-width="2"/>
        <text x="220" y="256" font-family="sans-serif" font-size="10.5" fill="#475569">• Bilal S.</text>

        <!-- Red Strikethrough Stamp Overlay -->
        <g transform="translate(420, 160)" rotate="12">
          <rect x="0" y="0" width="140" height="40" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
          <text x="70" y="25" font-family="sans-serif" font-size="12" font-weight="800" fill="#ef4444" text-anchor="middle">DROPPED</text>
        </g>

        <!-- Wastebasket Below with discarded Badge -->
        <path d="M600 320 L640 320 L630 380 L610 380 Z" fill="#64748b"/>
        <rect x="605" y="310" width="30" height="20" rx="3" fill="#ef4444"/>
        """
    else:
        # Scene 6: Assignment Portal Omission
        title = "Omission from Final Project Submission Portal"
        art = f"""
        <!-- Portal Submission Frame -->
        <rect x="180" y="80" width="440" height="280" rx="12" fill="#ffffff" stroke="{p}" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Portal Top Banner -->
        <rect x="180" y="80" width="440" height="45" rx="12 12 0 0" fill="{p}"/>
        <text x="210" y="108" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">LMS Assignment Submission #4</text>
        
        <!-- Submitted Group Members List -->
        <g transform="translate(210, 145)">
          <text x="0" y="15" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a">Registered Group Contributors:</text>
          
          <rect x="0" y="30" width="380" height="32" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="14" y="50" font-family="sans-serif" font-size="10.5" fill="#334155">1. Usman Ghani (Lead Author)</text>
          
          <rect x="0" y="70" width="380" height="32" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="14" y="90" font-family="sans-serif" font-size="10.5" fill="#334155">2. Fatima Noor (Contributor)</text>

          <!-- Missing / Stricken 3rd member alert -->
          <rect x="0" y="110" width="380" height="42" rx="4" fill="#fef2f2" stroke="#fca5a5"/>
          <text x="14" y="128" font-family="sans-serif" font-size="10" font-weight="700" fill="#dc2626">Missing: Member 3 not included in final upload</text>
          <text x="14" y="142" font-family="sans-serif" font-size="9" fill="#7f1d1d">Status: Grade will not be applied to excluded student</text>
        </g>

        <!-- Lockout Icon Right Corner -->
        <circle cx="560" cy="115" r="16" fill="#ffffff"/>
        <text x="560" y="121" font-family="sans-serif" font-size="14" text-anchor="middle">🔒</text>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 3: PRIVATE INFO LEAK (6 Distinct Scenes)
# ==============================================================================

def get_leak_scene(variant: int) -> tuple:
    p, s = "#d97706", "#dc2626"
    bg1, bg2 = "#fffbeb", "#fef2f2"

    if variant == 1:
        # Scene 1: WhatsApp Forwarded Screenshot Broadcast
        title = "Private Chat Screenshot Leaked to Large Batch"
        art = f"""
        <!-- Large Smartphone Display -->
        <g transform="translate(250, 75)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="300" height="340" rx="24" fill="#ffffff" stroke="{p}" stroke-width="4"/>
          <!-- Chat Header -->
          <rect x="0" y="0" width="300" height="50" rx="24 24 0 0" fill="#075e54"/>
          <text x="30" y="30" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">University Batch 2026 (140)</text>

          <!-- Forwarded Tag Banner -->
          <g transform="translate(20, 65)">
            <rect x="0" y="0" width="260" height="150" rx="10" fill="#e7fce3" stroke="#25d366" stroke-width="1.5"/>
            <path d="M12 18 L24 18 M18 12 L24 18 L18 24" stroke="#64748b" stroke-width="1.8" fill="none"/>
            <text x="32" y="20" font-family="sans-serif" font-size="9.5" font-style="italic" fill="#64748b">Forwarded many times</text>

            <!-- Leaked Private Content -->
            <rect x="12" y="32" width="236" height="105" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
            <text x="22" y="52" font-family="sans-serif" font-size="10" font-weight="700" fill="#dc2626">Private Message with Hira:</text>
            <text x="22" y="70" font-family="sans-serif" font-size="9.5" fill="#334155">"Please don't tell anyone about my</text>
            <text x="22" y="85" font-family="sans-serif" font-size="9.5" fill="#334155">grade review or financial issue..."</text>
            <text x="22" y="115" font-family="sans-serif" font-size="8.5" fill="#94a3b8">Original Sent: Yesterday 11:42 PM</text>
          </g>

          <!-- Reactions Below Leak -->
          <g transform="translate(20, 230)">
            <rect x="0" y="0" width="260" height="40" rx="8" fill="#f8fafc"/>
            <text x="14" y="24" font-family="sans-serif" font-size="10" fill="#475569">🔥 28   😱 45   👀 82 views</text>
          </g>
        </g>

        <!-- Radiating Leak Signal Waves Left/Right -->
        <circle cx="150" cy="230" r="32" fill="#ffffff" stroke="{s}" stroke-width="2" filter="url(#shadow)"/>
        <text x="150" y="238" font-family="sans-serif" font-size="22" text-anchor="middle">🔓</text>

        <circle cx="650" cy="230" r="32" fill="#ffffff" stroke="{p}" stroke-width="2" filter="url(#shadow)"/>
        <text x="650" y="238" font-family="sans-serif" font-size="22" text-anchor="middle">📢</text>
        """
    elif variant == 2:
        # Scene 2: Medical Certificate Leak on Social Media
        title = "Confidential Medical Certificate Shared Online"
        art = f"""
        <!-- Clinical Clipboard Paper -->
        <rect x="220" y="80" width="360" height="290" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        <!-- Clipboard Clip -->
        <rect x="340" y="65" width="120" height="24" rx="4" fill="#475569"/>
        
        <!-- Hospital Header -->
        <text x="250" y="115" font-family="sans-serif" font-size="12" font-weight="800" fill="{s}">🏥 UNIVERSITY HEALTH CLINIC</text>
        <text x="250" y="130" font-family="sans-serif" font-size="9.5" fill="#64748b">Medical Leave Certificate • STRICTLY CONFIDENTIAL</text>
        <line x1="250" y1="140" x2="540" y2="140" stroke="#e2e8f0" stroke-width="1.5"/>

        <!-- Patient Name & Private Diagnosis Circled -->
        <text x="250" y="165" font-family="sans-serif" font-size="10" fill="#334155">Patient: Hamza R. | Roll #: 22-CS-041</text>
        <rect x="245" y="180" width="310" height="40" rx="4" fill="#fef2f2" stroke="{s}" stroke-width="1.5"/>
        <text x="255" y="200" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#b91c1c">Diagnosis: Acute Anxiety &amp; Medical Absence</text>
        <text x="255" y="213" font-family="sans-serif" font-size="9" fill="#7f1d1d">Recommendation: 3 Days Complete Bed Rest</text>

        <!-- Unauthorized Social Share Watermark -->
        <g transform="translate(245, 240)">
          <rect x="0" y="0" width="310" height="50" rx="6" fill="#fffbeb" stroke="{p}"/>
          <text x="14" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="{p}">Posted to Class Forum:</text>
          <text x="14" y="38" font-family="sans-serif" font-size="9.5" fill="#334155">"Look who's faking sick to skip the project presentation"</text>
        </g>
        """
    elif variant == 3:
        # Scene 3: Hostel Room Peeping Photo through Doorway
        title = "Hostel Room Candid Photos Taken Without Permission"
        art = f"""
        <!-- Door Frame Background Perspective -->
        <rect x="160" y="80" width="480" height="290" fill="#334155" rx="4"/>
        <!-- Cracked Open Door -->
        <path d="M160 80 L360 110 L360 370 L160 370 Z" fill="#1e293b"/>

        <!-- Glimpse of Private Hostel Room -->
        <rect x="360" y="110" width="280" height="260" fill="#fef3c7"/>
        <!-- Single Bed -->
        <rect x="420" y="220" width="200" height="60" rx="4" fill="#cbd5e1" stroke="#94a3b8"/>
        <rect x="580" y="215" width="35" height="30" rx="4" fill="#ffffff"/>
        <!-- Study Desk with family photo -->
        <rect x="380" y="260" width="80" height="70" fill="#b45309"/>
        <rect x="390" y="235" width="25" height="25" rx="2" fill="#ffffff" stroke="#d97706"/>

        <!-- Invasive Smartphone in Foreground Snap -->
        <g transform="translate(260, 160)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="90" height="150" rx="14" fill="#0f172a" stroke="{s}" stroke-width="2.5"/>
          <rect x="6" y="12" width="78" height="110" rx="6" fill="#1e293b"/>
          <circle cx="45" cy="65" r="22" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,2"/>
          <!-- Flashing recording light -->
          <circle cx="70" cy="24" r="5" fill="#ef4444"/>
          <text x="45" y="110" font-family="sans-serif" font-size="9" fill="#ffffff" text-anchor="middle">CAPTURED</text>
        </g>
        """
    elif variant == 4:
        # Scene 4: Secretly Recorded Phone Call Waveform
        title = "Secret Audio Recording of a Private Conversation"
        art = f"""
        <!-- Sound Recording Audio Player Interface -->
        <rect x="180" y="90" width="440" height="260" rx="16" fill="#1e293b" stroke="#334155" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Player Header -->
        <circle cx="215" cy="125" r="14" fill="{s}" fill-opacity="0.2"/>
        <text x="215" y="130" font-family="sans-serif" font-size="12" text-anchor="middle" fill="{s}">🎙️</text>
        <text x="240" y="125" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">Voice_Memo_Recorded_Stairwell.m4a</text>
        <text x="240" y="140" font-family="sans-serif" font-size="9.5" fill="#94a3b8">Shared without subject consent • 02:45 min</text>

        <!-- Audio Waveform Visualization Bars -->
        <g transform="translate(210, 165)">
          <rect x="0" y="10" width="6" height="40" rx="3" fill="{p}"/>
          <rect x="12" y="2" width="6" height="56" rx="3" fill="{p}"/>
          <rect x="24" y="15" width="6" height="30" rx="3" fill="{p}"/>
          <rect x="36" y="0" width="6" height="60" rx="3" fill="{s}"/>
          <rect x="48" y="8" width="6" height="44" rx="3" fill="{s}"/>
          <rect x="60" y="20" width="6" height="20" rx="3" fill="{p}"/>
          <rect x="72" y="5" width="6" height="50" rx="3" fill="{p}"/>
          <rect x="84" y="0" width="6" height="60" rx="3" fill="{s}"/>
          <rect x="96" y="12" width="6" height="36" rx="3" fill="{s}"/>
          <rect x="108" y="22" width="6" height="16" rx="3" fill="#64748b"/>
          <rect x="120" y="18" width="6" height="24" rx="3" fill="#64748b"/>
          <rect x="132" y="2" width="6" height="56" rx="3" fill="{s}"/>
          <rect x="144" y="10" width="6" height="40" rx="3" fill="{s}"/>
          <rect x="156" y="25" width="6" height="10" rx="3" fill="#64748b"/>
          <rect x="168" y="5" width="6" height="50" rx="3" fill="{p}"/>
          <rect x="180" y="15" width="6" height="30" rx="3" fill="{p}"/>
          <rect x="192" y="0" width="6" height="60" rx="3" fill="{p}"/>
          <rect x="204" y="12" width="6" height="36" rx="3" fill="{s}"/>
          <rect x="216" y="20" width="6" height="20" rx="3" fill="#64748b"/>
          <rect x="228" y="8" width="6" height="44" rx="3" fill="{p}"/>
          <rect x="240" y="0" width="6" height="60" rx="3" fill="{s}"/>
          <rect x="252" y="15" width="6" height="30" rx="3" fill="{p}"/>
          <rect x="264" y="25" width="6" height="10" rx="3" fill="#64748b"/>
          <rect x="276" y="5" width="6" height="50" rx="3" fill="{p}"/>
          <rect x="288" y="12" width="6" height="36" rx="3" fill="{s}"/>
          <rect x="300" y="18" width="6" height="24" rx="3" fill="#64748b"/>
          <rect x="312" y="0" width="6" height="60" rx="3" fill="{s}"/>
          <rect x="324" y="8" width="6" height="44" rx="3" fill="{p}"/>
          <rect x="336" y="20" width="6" height="20" rx="3" fill="#64748b"/>
          <rect x="348" y="15" width="6" height="30" rx="3" fill="{s}"/>
        </g>

        <!-- Forward Warning Below -->
        <rect x="210" y="255" width="380" height="45" rx="8" fill="#0f172a"/>
        <text x="230" y="275" font-family="sans-serif" font-size="10" fill="#fca5a5">⚠️ Excerpt: Personal family disagreement shared in class Telegram</text>
        <text x="230" y="289" font-family="sans-serif" font-size="9" fill="#94a3b8">Downloads: 34 students</text>
        """
    elif variant == 5:
        # Scene 5: Confidential Grade Sheet Leak
        title = "Exam Result & GPA Sheet Circulated Without Consent"
        art = f"""
        <!-- Portal Sheet Display -->
        <rect x="190" y="85" width="420" height="270" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <rect x="190" y="85" width="420" height="40" rx="10 10 0 0" fill="#334155"/>
        <text x="215" y="110" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">OFFICIAL GRADE TRANSCRIPT (SEMESTER 4)</text>

        <!-- Grade Table -->
        <g transform="translate(215, 140)">
          <!-- Row 1 -->
          <rect x="0" y="0" width="370" height="30" fill="#f8fafc"/>
          <text x="10" y="20" font-family="sans-serif" font-size="10.5" fill="#334155">Operating Systems Lab</text>
          <text x="250" y="20" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#10b981">88% (A)</text>

          <!-- Row 2 (Target's Low Grade Highlighted by Leaker) -->
          <rect x="0" y="35" width="370" height="35" fill="#fef2f2" stroke="{s}" stroke-width="1.5"/>
          <text x="10" y="57" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#b91c1c">Data Structures Midterm (Fatima A.)</text>
          <text x="250" y="57" font-family="sans-serif" font-size="11" font-weight="800" fill="#b91c1c">42% (F)</text>
          <circle cx="330" cy="52" r="10" fill="{s}" fill-opacity="0.2"/>
          <text x="330" y="56" font-family="sans-serif" font-size="10" fill="{s}" text-anchor="middle">🔍</text>

          <!-- Row 3 -->
          <rect x="0" y="75" width="370" height="30" fill="#f8fafc"/>
          <text x="10" y="95" font-family="sans-serif" font-size="10.5" fill="#334155">Software Engineering</text>
          <text x="250" y="95" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#10b981">78% (B+)</text>
        </g>

        <!-- Social Gossip Banner Tag Below -->
        <g transform="translate(215, 270)">
          <rect x="0" y="0" width="370" height="40" rx="6" fill="#fffbeb" stroke="{p}"/>
          <text x="12" y="18" font-family="sans-serif" font-size="9.5" font-weight="700" fill="{p}">Posted to Batch Discussion:</text>
          <text x="12" y="32" font-family="sans-serif" font-size="9" fill="#334155">"Look at Miss Perfect's actual midterm marks lol"</text>
        </g>
        """
    else:
        # Scene 6: Family Hardship Financial Aid Leak
        title = "Personal Financial Hardship Document Leaked"
        art = f"""
        <!-- Financial Aid Application Document -->
        <rect x="200" y="80" width="400" height="280" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <text x="230" y="115" font-family="sans-serif" font-size="12" font-weight="800" fill="{p}">UNIVERSITY SCHOLARSHIP &amp; AID OFFICE</text>
        <text x="230" y="130" font-family="sans-serif" font-size="9.5" fill="#64748b">Need-Based Financial Assistance Form</text>
        <line x1="230" y1="140" x2="570" y2="140" stroke="#e2e8f0" stroke-width="1.5"/>

        <!-- Private Details Box Highlighted in Red -->
        <g transform="translate(230, 155)">
          <rect x="0" y="0" width="340" height="65" rx="6" fill="#fef2f2" stroke="{s}" stroke-width="1.5"/>
          <text x="12" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#b91c1c">CONFIDENTIAL FAMILY INCOME DETAILS:</text>
          <text x="12" y="38" font-family="sans-serif" font-size="9.5" fill="#334155">Applicant declares household medical debt &amp; low income.</text>
          <text x="12" y="52" font-family="sans-serif" font-size="9" fill="#7f1d1d">Status: Verified for emergency fee installment plan</text>
        </g>

        <!-- Unauthorized Online Discussion Thread -->
        <g transform="translate(230, 235)">
          <rect x="0" y="0" width="340" height="55" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
          <circle cx="20" cy="20" r="10" fill="{s}" fill-opacity="0.2"/>
          <text x="35" y="23" font-family="sans-serif" font-size="10" font-weight="700" fill="{s}">Anonymous Post in Student Group:</text>
          <text x="12" y="42" font-family="sans-serif" font-size="9.5" fill="#334155">"Sharing details about Arham's fee discount application..."</text>
        </g>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 4: FALSE RUMOUR (6 Distinct Scenes)
# ==============================================================================

def get_rumour_scene(variant: int) -> tuple:
    p, s = "#ea580c", "#7c3aed"
    bg1, bg2 = "#fff7ed", "#faf5ff"

    if variant == 1:
        # Scene 1: Examination Cheating Whisper Network
        title = "Exam Paper Leak False Accusation Whisper Network"
        art = f"""
        <!-- Examination Room Desks Silhouette -->
        <rect x="120" y="260" width="160" height="90" rx="6" fill="#e2e8f0" stroke="#cbd5e1"/>
        <rect x="320" y="260" width="160" height="90" rx="6" fill="#e2e8f0" stroke="#cbd5e1"/>
        <rect x="520" y="260" width="160" height="90" rx="6" fill="#e2e8f0" stroke="#cbd5e1"/>

        <!-- Central High Scoring Student -->
        <g transform="translate(370, 160)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="60" rx="6" fill="{p}"/>
          <!-- 100% Exam paper in hand -->
          <rect x="20" y="70" width="35" height="40" rx="3" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
          <text x="37" y="95" font-family="sans-serif" font-size="11" font-weight="800" fill="#10b981" text-anchor="middle">100%</text>
        </g>

        <!-- Dotted Whisper Trails from Left & Right -->
        <path d="M220 220 Q290 170 350 200" fill="none" stroke="{s}" stroke-width="2.5" stroke-dasharray="6,4"/>
        <path d="M580 220 Q510 170 450 200" fill="none" stroke="{s}" stroke-width="2.5" stroke-dasharray="6,4"/>

        <!-- Floating Rumour Speech Balloons -->
        <g transform="translate(140, 120)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="170" height="50" rx="10" fill="#ffffff" stroke="{s}" stroke-width="1.8"/>
          <text x="14" y="22" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{s}">"He got the paper early!"</text>
          <text x="14" y="38" font-family="sans-serif" font-size="9.5" fill="#64748b">Unverified exam gossip</text>
        </g>

        <g transform="translate(490, 120)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="170" height="50" rx="10" fill="#ffffff" stroke="{p}" stroke-width="1.8"/>
          <text x="14" y="22" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{p}">"Teacher leaked questions"</text>
          <text x="14" y="38" font-family="sans-serif" font-size="9.5" fill="#64748b">Spreading across batch</text>
        </g>
        """
    elif variant == 2:
        # Scene 2: Startup Competition Plagiarism Claim
        title = "Startup Competition Plagiarism Smear"
        art = f"""
        <!-- Auditorium Presentation Stage -->
        <rect x="180" y="90" width="440" height="260" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Trophy & Stage Banner -->
        <rect x="180" y="90" width="440" height="45" rx="12 12 0 0" fill="#1e293b"/>
        <text x="210" y="118" font-family="sans-serif" font-size="12" font-weight="700" fill="#f59e0b">🏆 UNIVERSITY STARTUP SEED PITCH 2026</text>

        <!-- Trophy on Table -->
        <g transform="translate(230, 150)">
          <path d="M20 20 L40 20 L35 50 L25 50 Z" fill="#f59e0b" stroke="#d97706"/>
          <rect x="15" y="50" width="30" height="8" rx="2" fill="#b45309"/>
          <circle cx="30" cy="20" r="14" fill="#fef08a"/>
          <text x="30" y="25" font-family="sans-serif" font-size="12" text-anchor="middle">1st</text>
        </g>

        <!-- Smear Tweet Notification Overlaid -->
        <g transform="translate(290, 155)">
          <rect x="0" y="0" width="300" height="70" rx="8" fill="#fef2f2" stroke="{p}" stroke-width="1.8"/>
          <circle cx="20" cy="22" r="10" fill="{p}" fill-opacity="0.2"/>
          <text x="20" y="26" font-family="sans-serif" font-size="11" text-anchor="middle">📢</text>
          <text x="38" y="22" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#b91c1c">Alumni Group Post • Viral:</text>
          <text x="14" y="42" font-family="sans-serif" font-size="10" fill="#334155">"Winning pitch was 100% stolen from a 2023 thesis.</text>
          <text x="14" y="58" font-family="sans-serif" font-size="9.5" fill="#64748b">Faculty mentor should revoke the award #FakeWinner"</text>
        </g>

        <!-- Retweet counters -->
        <g transform="translate(290, 240)">
          <rect x="0" y="0" width="180" height="30" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="14" y="20" font-family="sans-serif" font-size="10" fill="{s}">🔁 84 shares   💬 42 comments</text>
        </g>
        """
    elif variant == 3:
        # Scene 3: Anonymous Confession Page Defamation
        title = "Defamation on Anonymous Instagram Confession Page"
        art = f"""
        <!-- Instagram/Social Phone Layout -->
        <g transform="translate(260, 75)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="280" height="340" rx="22" fill="#000000" stroke="{s}" stroke-width="3"/>
          
          <!-- Profile Header -->
          <circle cx="35" cy="30" r="16" fill="#1e1b4b"/>
          <text x="35" y="35" font-family="sans-serif" font-size="14" text-anchor="middle">🎭</text>
          <text x="60" y="28" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff">Uni_Confessions_Official</text>
          <text x="60" y="42" font-family="sans-serif" font-size="9" fill="#a5b4fc">24k followers • Anonymous</text>

          <!-- Confession Text Post Card -->
          <rect x="15" y="60" width="250" height="170" rx="12" fill="#18181b" stroke="#27272a"/>
          <text x="25" y="85" font-family="sans-serif" font-size="11" font-weight="800" fill="{p}">#CONFESSION_8492</text>
          <text x="25" y="110" font-family="sans-serif" font-size="10.5" fill="#fafafa">"Everyone in CS Section B knows</text>
          <text x="25" y="128" font-family="sans-serif" font-size="10.5" fill="#fafafa">what Mahnoor did to get her</text>
          <text x="25" y="146" font-family="sans-serif" font-size="10.5" fill="#fafafa">internship offer. Totally unfair to</text>
          <text x="25" y="164" font-family="sans-serif" font-size="10.5" fill="#fafafa">deserving students. 🐍"</text>
          
          <line x1="25" y1="185" x2="255" y2="185" stroke="#27272a"/>
          <text x="25" y="205" font-family="sans-serif" font-size="9.5" fill="#e11d48">❤️ 412 likes • 89 comments</text>

          <!-- Reaction Bar Below -->
          <rect x="15" y="245" width="250" height="40" rx="8" fill="#27272a"/>
          <text x="30" y="270" font-family="sans-serif" font-size="11" fill="#a1a1aa">Add a comment...</text>
        </g>
        """
    elif variant == 4:
        # Scene 4: Fabricated / Inspect-Element Chat Forgery
        title = "Manufactured Chat Forgery via Inspect Element"
        art = f"""
        <!-- Desktop Browser Showing Developer Tools -->
        <rect x="180" y="80" width="440" height="280" rx="10" fill="#1e293b" stroke="#334155" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Devtools Split Screen -->
        <rect x="180" y="80" width="220" height="280" fill="#0f172a" rx="10 0 0 10"/>
        <!-- HTML Code Inspection on Left -->
        <g transform="translate(195, 110)" font-family="monospace" font-size="10">
          <text x="0" y="15" fill="#60a5fa">&lt;div class="message"&gt;</text>
          <text x="10" y="35" fill="#fbbf24">data-user="Zainab"</text>
          <rect x="8" y="45" width="180" height="20" fill="rgba(234, 88, 12, 0.25)"/>
          <text x="12" y="60" fill="#f97316">EDITING TEXT...</text>
          <text x="0" y="85" fill="#60a5fa">&lt;/div&gt;</text>
        </g>

        <!-- Right Side: Fake Rendered Preview -->
        <g transform="translate(415, 110)">
          <rect x="0" y="0" width="190" height="110" rx="8" fill="#ffffff"/>
          <text x="12" y="24" font-family="sans-serif" font-size="10" font-weight="700" fill="#ef4444">FAKE FABRICATED CHAT:</text>
          <rect x="10" y="35" width="170" height="45" rx="6" fill="#fef2f2" stroke="#fecaca"/>
          <text x="16" y="52" font-family="sans-serif" font-size="9" fill="#991b1b">"I'm going to sabotage</text>
          <text x="16" y="66" font-family="sans-serif" font-size="9" fill="#991b1b">the group project files."</text>
          <text x="12" y="98" font-family="sans-serif" font-size="8.5" fill="#64748b">Ready to screenshot &amp; spread</text>
        </g>

        <!-- Warning Stamp -->
        <g transform="translate(425, 240)">
          <rect x="0" y="0" width="170" height="35" rx="6" fill="{s}"/>
          <text x="85" y="22" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">FORGERY TOOL</text>
        </g>
        """
    elif variant == 5:
        # Scene 5: Clinical Ward False Slander
        title = "Medical Ward Routine Check Falsely Slandered as Fatal Error"
        art = f"""
        <!-- Hospital Nursing Station Counter -->
        <rect x="150" y="220" width="500" height="30" rx="4" fill="#64748b"/>
        <rect x="180" y="250" width="440" height="110" fill="#cbd5e1"/>

        <!-- Medical Patient Chart -->
        <g transform="translate(220, 110)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="180" height="120" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
          <text x="15" y="25" font-family="sans-serif" font-size="10" font-weight="800" fill="{p}">PATIENT CHART #0412</text>
          <text x="15" y="42" font-family="sans-serif" font-size="9" fill="#334155">Attending Note: Routine check</text>
          <circle cx="150" cy="80" r="16" fill="#10b981" fill-opacity="0.2"/>
          <text x="150" y="85" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#10b981">✓</text>
        </g>

        <!-- Slanderous Chat Broadcast Overlaid -->
        <g transform="translate(420, 110)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="220" height="110" rx="8" fill="#ffffff" stroke="{s}" stroke-width="2"/>
          <circle cx="20" cy="20" r="10" fill="{s}" fill-opacity="0.2"/>
          <text x="35" y="24" font-family="sans-serif" font-size="10" font-weight="700" fill="{s}">WhatsApp Ward Group:</text>
          <text x="12" y="45" font-family="sans-serif" font-size="9.5" fill="#334155">"Did you see Hamza almost gave</text>
          <text x="12" y="60" font-family="sans-serif" font-size="9.5" fill="#334155">the wrong dosage today?</text>
          <text x="12" y="75" font-family="sans-serif" font-size="9.5" fill="#dc2626">He shouldn't pass rotation."</text>
          <text x="12" y="98" font-family="sans-serif" font-size="8.5" fill="#94a3b8">(Attending doctor had clarified false)</text>
        </g>
        """
    else:
        # Scene 6: Apartment Expense Theft Rumor
        title = "Fabricated Utility Theft Accusation in Shared Housing"
        art = f"""
        <!-- Apartment Hallway Wall with Pinned Flyer -->
        <rect x="180" y="80" width="440" height="270" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Pinned Accusatory Flyer -->
        <g transform="translate(240, 105)" filter="url(#shadow)">
          <!-- Push pin -->
          <circle cx="160" cy="8" r="6" fill="#dc2626"/>
          <rect x="0" y="10" width="320" height="140" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="1.8"/>
          <text x="20" y="35" font-family="sans-serif" font-size="12" font-weight="800" fill="#b91c1c">⚠️ NOTICE TO APARTMENT RESIDENTS</text>
          <text x="20" y="58" font-family="sans-serif" font-size="10.5" fill="#334155">"Student in Flat 4B has refused to pay</text>
          <text x="20" y="74" font-family="sans-serif" font-size="10.5" fill="#334155">their shared utility bill and pocketed funds.</text>
          <text x="20" y="94" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#b91c1c">Do not partner with them on housing!"</text>
          <text x="20" y="125" font-family="sans-serif" font-size="9" fill="#64748b">Verified receipt was already paid • Slander</text>
        </g>

        <!-- Whispering Roommates in Doorway on Left -->
        <circle cx="130" cy="220" r="18" fill="#fed7aa"/>
        <rect x="115" y="238" width="30" height="50" rx="6" fill="{p}"/>
        <circle cx="160" cy="225" r="18" fill="#fed7aa"/>
        <rect x="145" y="243" width="30" height="45" rx="6" fill="{s}"/>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 5: THREATS (6 Distinct Scenes)
# ==============================================================================

def get_threats_scene(variant: int) -> tuple:
    p, s = "#b91c1c", "#475569"
    bg1, bg2 = "#fef2f2", "#f8fafc"

    if variant == 1:
        # Scene 1: Late-Night Hostile DM Alarm Clock
        title = "Late-Night Hostile DM and Coercive Ultimatum"
        art = f"""
        <!-- Dark Bedroom Nightstand Atmosphere -->
        <rect x="80" y="80" width="640" height="290" rx="12" fill="#0f172a"/>
        
        <!-- Glowing Red Alarm Clock -->
        <rect x="130" y="230" width="110" height="65" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <text x="185" y="272" font-family="monospace" font-size="24" font-weight="800" fill="#ef4444" text-anchor="middle">02:14</text>
        <text x="185" y="288" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">AM • SILENT NIGHT</text>

        <!-- Smartphone Illuminating in the Dark with Threatening Message -->
        <g transform="translate(320, 110)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="240" height="230" rx="16" fill="#18181b" stroke="#ef4444" stroke-width="2.5"/>
          
          <!-- Threat Banner -->
          <rect x="12" y="15" width="216" height="35" rx="6" fill="#7f1d1d"/>
          <text x="120" y="37" font-family="sans-serif" font-size="11" font-weight="800" fill="#fecaca" text-anchor="middle">⚠️ AGGRESSIVE ULTIMATUM</text>

          <!-- The Threatening Text -->
          <rect x="12" y="60" width="216" height="100" rx="8" fill="#27272a"/>
          <text x="24" y="85" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#ef4444">From: Unknown User</text>
          <text x="24" y="105" font-family="sans-serif" font-size="10" fill="#ffffff">"Drop the dispute with CR by</text>
          <text x="24" y="122" font-family="sans-serif" font-size="10" fill="#ffffff">tomorrow morning or you will</text>
          <text x="24" y="139" font-family="sans-serif" font-size="10" font-weight="700" fill="#f87171">regret showing up in class."</text>

          <text x="120" y="185" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Countdown: 06 hrs 45 mins left</text>
        </g>
        """
    elif variant == 2:
        # Scene 2: Hallway Cornering & Physical Blockade
        title = "Campus Corridor Cornering and Intimidation"
        art = f"""
        <!-- Perspective Corridor with Lockers -->
        <rect x="80" y="80" width="640" height="290" rx="8" fill="#f1f5f9"/>
        <!-- Locker Panels on Right -->
        <g fill="#94a3b8" stroke="#64748b" stroke-width="1.5">
          <rect x="520" y="90" width="40" height="270"/>
          <rect x="560" y="90" width="40" height="270"/>
          <rect x="600" y="90" width="40" height="270"/>
          <rect x="640" y="90" width="40" height="270"/>
        </g>

        <!-- Long Menacing Shadows on Floor -->
        <ellipse cx="400" cy="330" rx="90" ry="15" fill="#334155" fill-opacity="0.3"/>

        <!-- Targeted Student Pressed Against Lockers -->
        <g transform="translate(470, 160)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <path d="M10 18 Q25 8 40 18 Z" fill="#0f172a"/>
          <rect x="8" y="45" width="34" height="85" rx="6" fill="#3b82f6"/>
          <!-- Books clutched defensiveness -->
          <rect x="12" y="65" width="28" height="35" rx="3" fill="#f59e0b" stroke="#b45309"/>
        </g>

        <!-- Two Intimidating Aggressor Figures Blocking Corridor -->
        <g transform="translate(320, 130)">
          <!-- Tall Intimidator 1 -->
          <circle cx="30" cy="30" r="24" fill="#fed7aa"/>
          <path d="M10 20 Q30 5 50 20 Z" fill="#1e293b"/>
          <rect x="8" y="54" width="44" height="100" rx="8" fill="#1e293b"/>
          <!-- Arm leaning on locker blocking exit -->
          <line x1="52" y1="75" x2="140" y2="70" stroke="#fed7aa" stroke-width="8" stroke-linecap="round"/>
        </g>
        <g transform="translate(240, 150)">
          <circle cx="26" cy="26" r="22" fill="#fed7aa"/>
          <rect x="6" y="48" width="40" height="90" rx="8" fill="#475569"/>
        </g>
        """
    elif variant == 3:
        # Scene 3: Doxxing Threat Terminal
        title = "Doxxing Threat and Personal Address Exposure"
        art = f"""
        <!-- Dark Terminal Screen -->
        <rect x="180" y="80" width="440" height="280" rx="12" fill="#090d16" stroke="#ef4444" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Terminal Header -->
        <rect x="180" y="80" width="440" height="35" rx="12 12 0 0" fill="#1e293b"/>
        <circle cx="202" cy="97" r="4" fill="#ef4444"/>
        <circle cx="215" cy="97" r="4" fill="#f59e0b"/>
        <text x="240" y="102" font-family="monospace" font-size="11" fill="#94a3b8">doxx_payload_target_01.sh</text>

        <!-- Exposed Personal Information in Terminal -->
        <g transform="translate(210, 130)" font-family="monospace" font-size="10.5">
          <text x="0" y="18" fill="#ef4444">[TARGET LOCATED] CNIC: 42101-*******-3</text>
          <text x="0" y="38" fill="#38bdf8">RESIDENTIAL ADDRESS: House 14-B, Sector G-10</text>
          <text x="0" y="58" fill="#38bdf8">PHONE: +92 300 *******</text>
          <text x="0" y="78" fill="#38bdf8">FAMILY CONTACTS: Leaked from student portal</text>
        </g>

        <!-- Ransom / Intimidation Dialog Box Overlay -->
        <g transform="translate(230, 220)">
          <rect x="0" y="0" width="340" height="60" rx="6" fill="#7f1d1d" stroke="#fca5a5" stroke-width="1.5"/>
          <text x="170" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">"WITHDRAW REPORT OR THIS LEAKS IN 1 HOUR"</text>
          <text x="170" y="44" font-family="sans-serif" font-size="9.5" fill="#fecaca" text-anchor="middle">Timer: 00:58:24 remaining • Do not test us</text>
        </g>
        """
    elif variant == 4:
        # Scene 4: Academic Blackmail in Group Project
        title = "Academic Coercion and Contribution Blackmail"
        art = f"""
        <!-- Empty Classroom Meeting Desk -->
        <rect x="160" y="260" width="480" height="20" rx="4" fill="#334155"/>
        <rect x="180" y="280" width="20" height="80" fill="#475569"/>
        <rect x="600" y="280" width="20" height="80" fill="#475569"/>

        <!-- Project Binder on Desk -->
        <rect x="360" y="240" width="70" height="20" rx="2" fill="#ef4444"/>
        <text x="395" y="254" font-family="sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">PROJECT</text>

        <!-- Seated Victim Student -->
        <g transform="translate(240, 160)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <rect x="8" y="45" width="34" height="65" rx="6" fill="#0284c7"/>
        </g>

        <!-- Aggressor Leaning Aggressively Over Table -->
        <g transform="translate(460, 110)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 5 48 20 Z" fill="#0f172a"/>
          <!-- Leaning forward posture with hands on table -->
          <rect x="10" y="52" width="40" height="90" rx="8" fill="#1e293b"/>
          <line x1="10" y1="80" x2="-35" y2="150" stroke="#fed7aa" stroke-width="8" stroke-linecap="round"/>
          <circle cx="-35" cy="150" r="5" fill="#fed7aa"/>
          
          <!-- Coercive Speech Bubble -->
          <rect x="-140" y="-10" width="160" height="42" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="1.8"/>
          <text x="-60" y="10" font-family="sans-serif" font-size="10" font-weight="700" fill="#b91c1c" text-anchor="middle">"Do our 3 sections alone or</text>
          <text x="-60" y="24" font-family="sans-serif" font-size="10" font-weight="700" fill="#b91c1c" text-anchor="middle">we claim you did zero work."</text>
        </g>
        """
    elif variant == 5:
        # Scene 5: Silencing Threat Outside Grievance Office
        title = "Intimidation Threat Outside Grievance Committee"
        art = f"""
        <!-- Frosted Glass Office Door -->
        <rect x="220" y="80" width="360" height="290" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" filter="url(#cardShadow)"/>
        <!-- Glass Signboard -->
        <rect x="260" y="120" width="280" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="400" y="145" font-family="sans-serif" font-size="11" font-weight="800" fill="#0f172a" text-anchor="middle">DEAN OF STUDENT AFFAIRS</text>
        <text x="400" y="165" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Campus Ethics &amp; Anti-Harassment Cell</text>

        <!-- Student Holding Submission Envelope -->
        <g transform="translate(260, 200)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <rect x="8" y="45" width="34" height="85" rx="6" fill="#475569"/>
          <!-- Envelope in hand -->
          <rect x="25" y="70" width="35" height="25" rx="2" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5"/>
        </g>

        <!-- Phone Intercept Alert on Screen -->
        <g transform="translate(380, 210)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="200" height="90" rx="10" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
          <text x="14" y="24" font-family="sans-serif" font-size="10" font-weight="700" fill="#f87171">Incoming Warning Message:</text>
          <text x="14" y="45" font-family="sans-serif" font-size="9.5" fill="#ffffff">"Do not submit that envelope.</text>
          <text x="14" y="60" font-family="sans-serif" font-size="9.5" fill="#ffffff">We know where your hostel</text>
          <text x="14" y="75" font-family="sans-serif" font-size="9.5" fill="#fca5a5">room is."</text>
        </g>
        """
    else:
        # Scene 6: Swarm Tag Bombardment
        title = "Hostile Tag Avalanche and Coordinated Swarming"
        art = f"""
        <!-- Central Phone Surrounded by Red Notification Badges -->
        <g transform="translate(280, 85)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="240" height="280" rx="20" fill="#ffffff" stroke="{p}" stroke-width="3"/>
          <rect x="0" y="0" width="240" height="40" rx="20 20 0 0" fill="#991b1b"/>
          <text x="120" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">🚨 84 DIRECT MENTIONS</text>
          
          <!-- Incoming Threat Alerts in Stream -->
          <rect x="15" y="55" width="210" height="40" rx="6" fill="#fef2f2" stroke="#fca5a5"/>
          <text x="25" y="75" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#b91c1c">@Arslan: "Answer right now"</text>
          
          <rect x="15" y="105" width="210" height="40" rx="6" fill="#fef2f2" stroke="#fca5a5"/>
          <text x="25" y="125" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#b91c1c">@Khadija: "You're done on campus"</text>

          <rect x="15" y="155" width="210" height="40" rx="6" fill="#fef2f2" stroke="#fca5a5"/>
          <text x="25" y="175" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#b91c1c">@Shahmeer: "Last chance to retract"</text>
        </g>

        <!-- Swarming Notification Badges Radiating -->
        <g transform="translate(140, 140)" filter="url(#shadow)">
          <circle cx="30" cy="30" r="26" fill="#dc2626"/>
          <text x="30" y="36" font-family="sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">! 50+</text>
        </g>
        <g transform="translate(560, 140)" filter="url(#shadow)">
          <circle cx="30" cy="30" r="26" fill="#dc2626"/>
          <text x="30" y="36" font-family="sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">⚠️ 34</text>
        </g>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 6: HUMILIATING CONTENT (6 Distinct Scenes)
# ==============================================================================

def get_humiliating_scene(variant: int) -> tuple:
    p, s = "#9333ea", "#db2777"
    bg1, bg2 = "#faf5ff", "#fdf2f8"

    if variant == 1:
        # Scene 1: Presentation Stumble Live Recording
        title = "Recording and Streaming an Accidental Classroom Stumble"
        art = f"""
        <!-- Blackboard in Classroom Background -->
        <rect x="150" y="80" width="500" height="160" rx="8" fill="#14532d" stroke="#166534" stroke-width="4"/>
        <text x="180" y="120" font-family="sans-serif" font-size="14" fill="#86efac">Econ 201: Fiscal Policy Seminar</text>

        <!-- Targeted Presenter Tripping over Cord -->
        <g transform="translate(370, 160)">
          <!-- Tangled floor cable -->
          <path d="M30 140 Q45 130 60 140 Q75 145 90 135" fill="none" stroke="#000000" stroke-width="4"/>
          <!-- Falling posture -->
          <circle cx="40" cy="30" r="22" fill="#fed7aa"/>
          <rect x="25" y="52" width="35" height="65" rx="6" fill="{p}"/>
          <path d="M10 70 L-20 90" stroke="#fed7aa" stroke-width="7" stroke-linecap="round"/>
        </g>

        <!-- Foreground Smartphone Framing the Mishap with Live Stream Bar -->
        <g transform="translate(260, 190)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="160" height="150" rx="14" fill="#0f172a" stroke="{s}" stroke-width="2.5"/>
          <rect x="8" y="12" width="144" height="110" rx="6" fill="#1e293b"/>
          <rect x="16" y="20" width="45" height="16" rx="3" fill="#dc2626"/>
          <text x="38" y="32" font-family="sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">LIVE 184</text>
          <!-- Focus box framing the fall -->
          <rect x="50" y="45" width="60" height="50" fill="none" stroke="#eab308" stroke-width="1.8" stroke-dasharray="4,2"/>
        </g>
        """
    elif variant == 2:
        # Scene 2: Library Exam Sleep Candid Meme
        title = "Sneaking a Candid Photo of a Sleeping Student"
        art = f"""
        <!-- Library Study Carrel -->
        <rect x="180" y="100" width="440" height="260" rx="6" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Open Textbooks on Desk -->
        <rect x="250" y="250" width="140" height="60" rx="4" fill="#ffffff" stroke="#94a3b8"/>
        <line x1="320" y1="250" x2="320" y2="310" stroke="#cbd5e1" stroke-width="2"/>

        <!-- Student Sleeping Face Down on Textbooks -->
        <g transform="translate(300, 170)">
          <circle cx="35" cy="45" r="24" fill="#fed7aa"/>
          <path d="M15 35 Q35 20 55 35 Z" fill="#1e293b"/>
          <rect x="10" y="65" width="65" height="45" rx="8" fill="{p}"/>
          <!-- ZZZ floating -->
          <text x="80" y="25" font-family="sans-serif" font-size="16" font-weight="700" fill="#94a3b8">Z z z</text>
        </g>

        <!-- Prankster Snapping Selfie with Sleeping Student in Background -->
        <g transform="translate(480, 130)" filter="url(#cardShadow)">
          <circle cx="40" cy="35" r="26" fill="#fed7aa"/>
          <path d="M15 25 Q40 8 65 25 Z" fill="#0f172a"/>
          <!-- Pointing camera backwards laughing -->
          <rect x="15" y="80" width="70" height="120" rx="10" fill="#0f172a" stroke="{s}" stroke-width="2"/>
          <circle cx="50" cy="110" r="16" fill="{s}" fill-opacity="0.3"/>
          <circle cx="50" cy="95" r="3" fill="#ef4444"/>
          <!-- Flash Burst -->
          <polygon points="50,75 55,85 65,85 58,92 60,102 50,96 40,102 42,92 35,85 45,85" fill="#fef08a"/>
        </g>
        """
    elif variant == 3:
        # Scene 3: Deepfake Graphic Design Editing
        title = "Fabricating Derogatory Memes via Photo-Editing Software"
        art = f"""
        <!-- Graphic Tablet Canvas -->
        <rect x="170" y="80" width="460" height="280" rx="10" fill="#1e293b" stroke="#334155" stroke-width="4" filter="url(#cardShadow)"/>
        
        <!-- Software Top Menu -->
        <rect x="170" y="80" width="460" height="30" fill="#0f172a" rx="10 10 0 0"/>
        <text x="190" y="100" font-family="sans-serif" font-size="10" fill="#94a3b8">PhotoEdit Suite - [student_id_manipulation.psd]</text>

        <!-- Canvas Left: Cropped Student ID Face -->
        <rect x="210" y="130" width="110" height="130" rx="6" fill="#ffffff" stroke="{s}" stroke-width="2"/>
        <circle cx="265" cy="180" r="28" fill="#fed7aa"/>
        <!-- Dotted cut-out line around face -->
        <circle cx="265" cy="180" r="34" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
        <text x="265" y="245" font-family="sans-serif" font-size="9" fill="#dc2626" text-anchor="middle">Face Cut-Out</text>

        <!-- Canvas Right: Derogatory Body Being Merged -->
        <g transform="translate(360, 130)">
          <rect x="0" y="0" width="160" height="150" rx="6" fill="#2d3748" stroke="#4a5568"/>
          <!-- Cartoonish body mockup -->
          <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#dc2626" stroke-width="2"/>
          <text x="80" y="55" font-family="sans-serif" font-size="16" text-anchor="middle">🤡</text>
          <path d="M40 85 Q80 130 120 85 Z" fill="#f59e0b"/>
          <text x="80" y="130" font-family="sans-serif" font-size="9.5" fill="#fecaca" text-anchor="middle">Meme Export Preset</text>
        </g>
        """
    elif variant == 4:
        # Scene 4: Campus Staircase Paper Drop Viral Video
        title = "Viral Recording of Dropped Project Folders on Quad Steps"
        art = f"""
        <!-- Concrete Campus Steps -->
        <path d="M120 200 L680 200 L660 240 L140 240 Z" fill="#cbd5e1" stroke="#94a3b8"/>
        <path d="M140 240 L660 240 L640 280 L160 280 Z" fill="#94a3b8" stroke="#64748b"/>
        <path d="M160 280 L640 280 L620 330 L180 330 Z" fill="#64748b" stroke="#475569"/>

        <!-- Scattered Papers and Folders All Over the Steps -->
        <g fill="#ffffff" stroke="#cbd5e1">
          <rect x="260" y="245" width="45" height="30" rx="2" transform="rotate(15 260 245)"/>
          <rect x="340" y="250" width="50" height="35" rx="2" transform="rotate(-25 340 250)"/>
          <rect x="420" y="285" width="45" height="30" rx="2" transform="rotate(40 420 285)"/>
          <rect x="290" y="290" width="60" height="35" rx="2" fill="#fed7aa" stroke="#f59e0b"/>
        </g>

        <!-- Distressed Student Kneeling Collecting Sheets -->
        <g transform="translate(350, 180)">
          <circle cx="25" cy="25" r="18" fill="#fed7aa"/>
          <rect x="12" y="45" width="30" height="55" rx="6" fill="{p}"/>
        </g>

        <!-- Bystanders Filming Instead of Helping -->
        <g transform="translate(540, 120)">
          <circle cx="25" cy="25" r="18" fill="#fed7aa"/>
          <rect x="10" y="45" width="30" height="60" rx="6" fill="#334155"/>
          <!-- Phone aimed down -->
          <rect x="-10" y="55" width="20" height="35" rx="4" fill="#0f172a" stroke="{s}" stroke-width="1.5"/>
          <circle cx="0" cy="62" r="3" fill="#ef4444"/>
        </g>
        """
    elif variant == 5:
        # Scene 5: Canteen Spilled Drink Prank Video
        title = "Staged Canteen Prank Video Captured for Social Media"
        art = f"""
        <!-- Canteen Booth Table -->
        <rect x="200" y="260" width="400" height="20" rx="4" fill="#cbd5e1"/>
        <!-- Spilled Soda Drink & Puddle -->
        <ellipse cx="360" cy="270" rx="60" ry="12" fill="#b45309" fill-opacity="0.6"/>
        <rect x="420" y="240" width="18" height="35" rx="3" transform="rotate(75 420 240)" fill="#ef4444"/>

        <!-- Shocked Victim Standing Up from Booth -->
        <g transform="translate(260, 140)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <!-- Stained shirt -->
          <rect x="10" y="52" width="40" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
          <circle cx="25" cy="80" r="12" fill="#b45309" fill-opacity="0.4"/>
        </g>

        <!-- Prankster Behind Booth Aiming Phone Telephoto -->
        <g transform="translate(500, 120)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="110" height="170" rx="16" fill="#0f172a" stroke="{s}" stroke-width="2.5"/>
          <circle cx="55" cy="50" r="26" fill="{s}" fill-opacity="0.2"/>
          <text x="55" y="56" font-family="sans-serif" font-size="20" text-anchor="middle">🤣</text>
          <text x="55" y="100" font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="700">PRANKED!</text>
          <text x="55" y="120" font-family="sans-serif" font-size="9" fill="#f43f5e" text-anchor="middle">Uploading to TikTok...</text>
        </g>
        """
    else:
        # Scene 6: Hybrid Class Grid Video Glitch Recording
        title = "Online Class Grid Mishap Screen Recording"
        art = f"""
        <!-- Large Computer Screen with Video Meeting Grid -->
        <rect x="180" y="80" width="440" height="280" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Video Conference Grid of 6 Tiles -->
        <!-- Tile 1 Instructor -->
        <rect x="200" y="100" width="125" height="75" rx="6" fill="#27272a"/>
        <circle cx="262" cy="130" r="14" fill="#fed7aa"/>
        <text x="262" y="165" font-family="sans-serif" font-size="8.5" fill="#a1a1aa" text-anchor="middle">Dr. Arslan (Host)</text>

        <!-- Tile 2 Student Classmate -->
        <rect x="335" y="100" width="125" height="75" rx="6" fill="#27272a"/>
        <circle cx="397" cy="130" r="14" fill="#fed7aa"/>
        <text x="397" y="165" font-family="sans-serif" font-size="8.5" fill="#a1a1aa" text-anchor="middle">Bilal K.</text>

        <!-- Tile 3 TARGET: Accidental Embarrassing Video Frame -->
        <rect x="470" y="100" width="135" height="75" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
        <circle cx="537" cy="130" r="16" fill="#fed7aa"/>
        <text x="537" y="135" font-family="sans-serif" font-size="14" text-anchor="middle">😱</text>
        <rect x="480" y="153" width="70" height="14" rx="2" fill="#b91c1c"/>
        <text x="515" y="163" font-family="sans-serif" font-size="8" fill="#ffffff" text-anchor="middle">CAMERA GLITCH</text>

        <!-- Row 2 Tiles -->
        <rect x="200" y="185" width="125" height="75" rx="6" fill="#27272a"/>
        <rect x="335" y="185" width="125" height="75" rx="6" fill="#27272a"/>
        <rect x="470" y="185" width="135" height="75" rx="6" fill="#27272a"/>

        <!-- Screen Recording Indicator Across Top -->
        <rect x="200" y="270" width="405" height="30" rx="4" fill="#09090b"/>
        <circle cx="220" cy="285" r="4" fill="#ef4444"/>
        <text x="235" y="289" font-family="sans-serif" font-size="9.5" fill="#f87171">Someone in call is capturing screen video</text>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# THEME 7: GENERAL (6 Distinct Scenes)
# ==============================================================================

def get_general_scene(variant: int) -> tuple:
    p, s = "#2563eb", "#059669"
    bg1, bg2 = "#eff6ff", "#ecfdf5"

    if variant == 1:
        # Scene 1: Active Bystander Stepping in to Shield Victim
        title = "Active Bystander Stepping in to Halt Hostility"
        art = f"""
        <!-- Campus Walkway Tiles Ground -->
        <path d="M80 340 L720 340 L680 400 L120 400 Z" fill="#e2e8f0" stroke="#cbd5e1"/>

        <!-- Upstander Student in Center Holding Up Hand "STOP" -->
        <g transform="translate(370, 130)" filter="url(#softGlow)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="95" rx="8" fill="{s}"/>
          <!-- Raised Palm Hand Gesture "STOP" -->
          <line x1="10" y1="75" x2="-25" y2="60" stroke="#fed7aa" stroke-width="8" stroke-linecap="round"/>
          <circle cx="-27" cy="60" r="8" fill="#fed7aa"/>
          <path d="M-32 55 L-22 55 L-22 65 L-32 65 Z" fill="{s}"/>

          <!-- Speech Shield -->
          <rect x="-10" y="-30" width="120" height="34" rx="8" fill="#ffffff" stroke="{s}" stroke-width="2"/>
          <text x="50" y="-8" font-family="sans-serif" font-size="11" font-weight="800" fill="{s}" text-anchor="middle">"This stops here."</text>
        </g>

        <!-- Aggressor on the Left Backing Away -->
        <g transform="translate(180, 150)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <rect x="8" y="45" width="34" height="85" rx="6" fill="#64748b"/>
        </g>

        <!-- Relieved Victim Behind Upstander on Right -->
        <g transform="translate(530, 160)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <path d="M10 18 Q25 8 40 18 Z" fill="#0f172a"/>
          <rect x="8" y="45" width="34" height="80" rx="6" fill="{p}"/>
          <text x="25" y="20" font-family="sans-serif" font-size="12" text-anchor="middle">🛡️</text>
        </g>
        """
    elif variant == 2:
        # Scene 2: Quiet Peer Support in Library
        title = "Peer Empathy, Listening, and Emotional Support"
        art = f"""
        <!-- Library Study Booth Enclosure -->
        <rect x="160" y="90" width="480" height="270" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Booth Table -->
        <rect x="200" y="270" width="400" height="15" rx="3" fill="#cbd5e1"/>

        <!-- Warm Cup of Tea on Table -->
        <rect x="385" y="245" width="22" height="25" rx="3" fill="#ffffff" stroke="{s}" stroke-width="1.5"/>
        <path d="M396 240 Q392 230 398 220" fill="none" stroke="{s}" stroke-width="1.5"/>
        <text x="396" y="215" font-family="sans-serif" font-size="10" fill="{s}" text-anchor="middle">☕</text>

        <!-- Distressed Student on Left -->
        <g transform="translate(240, 150)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <rect x="10" y="52" width="40" height="80" rx="8" fill="#64748b"/>
        </g>

        <!-- Supportive Peer with Hand on Shoulder on Right -->
        <g transform="translate(470, 140)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="85" rx="8" fill="{p}"/>
          <!-- Reaching arm with comforting gesture -->
          <line x1="10" y1="75" x2="-80" y2="100" stroke="#fed7aa" stroke-width="7" stroke-linecap="round"/>
          <circle cx="-82" cy="100" r="5" fill="#fed7aa"/>

          <!-- Empathy Speech Bubble -->
          <rect x="-80" y="-30" width="150" height="34" rx="8" fill="#ecfdf5" stroke="{s}" stroke-width="1.5"/>
          <text x="-5" y="-9" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{s}" text-anchor="middle">"I'm here with you."</text>
        </g>
        """
    elif variant == 3:
        # Scene 3: Reporting to Campus Counselor
        title = "Reporting Cyberbullying Incident to University Counselor"
        art = f"""
        <!-- Counselor Office Atmosphere -->
        <rect x="170" y="80" width="460" height="280" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Potted Peace Plant in Corner -->
        <path d="M200 310 L220 310 L215 340 L205 340 Z" fill="#b45309"/>
        <circle cx="210" cy="295" r="18" fill="#10b981"/>

        <!-- Coffee Table in Counseling Room -->
        <ellipse cx="400" cy="280" rx="100" ry="25" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
        
        <!-- Tablet with Incident Documentation Log -->
        <rect x="360" y="260" width="75" height="45" rx="4" fill="#ffffff" stroke="{p}" stroke-width="1.8"/>
        <text x="397" y="280" font-family="sans-serif" font-size="8" font-weight="700" fill="{p}" text-anchor="middle">INCIDENT LOG</text>
        <line x1="370" y1="290" x2="425" y2="290" stroke="#10b981" stroke-width="2"/>

        <!-- Student on Left Sharing Experience -->
        <g transform="translate(250, 150)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <rect x="8" y="45" width="34" height="75" rx="6" fill="{p}"/>
        </g>

        <!-- University Counselor on Right Listening Actively with Notepad -->
        <g transform="translate(480, 140)">
          <circle cx="25" cy="25" r="20" fill="#fed7aa"/>
          <path d="M10 18 Q25 8 40 18 Z" fill="#334155"/>
          <rect x="8" y="45" width="34" height="85" rx="6" fill="{s}"/>
          <!-- Holding clipboard -->
          <rect x="-10" y="65" width="22" height="30" rx="2" fill="#ffffff" stroke="#94a3b8"/>
        </g>
        """
    elif variant == 4:
        # Scene 4: Preserving Digital Evidence
        title = "Systematic Preservation of Timestamps and Evidence"
        art = f"""
        <!-- Student Desk with Laptop and Desk Lamp -->
        <rect x="180" y="80" width="440" height="280" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Desk Lamp on Left Glowing -->
        <path d="M210 270 L210 140 L240 140" fill="none" stroke="#475569" stroke-width="4"/>
        <path d="M230 135 L260 145 L245 160 Z" fill="#f59e0b"/>
        <polygon points="245,160 350,300 200,300" fill="#fef08a" fill-opacity="0.12"/>

        <!-- Laptop Screen: Structured Evidence Folder -->
        <g transform="translate(270, 110)">
          <rect x="0" y="0" width="280" height="180" rx="8" fill="#1e293b"/>
          <!-- Folder Banner -->
          <rect x="0" y="0" width="280" height="30" rx="8 8 0 0" fill="#0f172a"/>
          <text x="25" y="20" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{s}">📁 Case_Evidence_Backup [Secured]</text>

          <!-- Verified Items List -->
          <g transform="translate(15, 45)" font-family="monospace" font-size="10">
            <rect x="0" y="0" width="250" height="25" rx="3" fill="#334155"/>
            <text x="10" y="16" fill="#38bdf8">✓ screenshot_threat_01_timestamp.png</text>
            
            <rect x="0" y="32" width="250" height="25" rx="3" fill="#334155"/>
            <text x="10" y="48" fill="#38bdf8">✓ batch_chat_export_log.txt</text>

            <rect x="0" y="64" width="250" height="25" rx="3" fill="#334155"/>
            <text x="10" y="80" fill="#38bdf8">✓ user_profile_id_proof.pdf</text>
          </g>

          <text x="140" y="165" font-family="sans-serif" font-size="9" fill="#10b981" text-anchor="middle">Ready for Student Grievance Submission</text>
        </g>
        """
    elif variant == 5:
        # Scene 5: Group Chat Upstander Intervention
        title = "Public Rejection of Bullying Inside Batch Chat"
        art = f"""
        <!-- Smartphone Stream Centered on Constructive Intervention -->
        <g transform="translate(250, 75)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="300" height="340" rx="24" fill="#ffffff" stroke="{p}" stroke-width="3"/>
          <rect x="0" y="0" width="300" height="45" rx="24 24 0 0" fill="{p}"/>
          <text x="30" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#ffffff">Classroom Group Chat (92)</text>

          <!-- Rude Message Being Shut Down -->
          <rect x="15" y="60" width="200" height="36" rx="8" fill="#fef2f2" stroke="#fca5a5"/>
          <text x="25" y="76" font-family="sans-serif" font-size="9.5" font-weight="700" fill="#b91c1c">Shahmeer:</text>
          <text x="25" y="88" font-family="sans-serif" font-size="9.5" fill="#7f1d1d">"Who told him he can speak in class? 🙄"</text>

          <!-- UPSTANDER INTERVENTION BUBBLE -->
          <g transform="translate(30, 115)">
            <rect x="0" y="0" width="255" height="90" rx="12" fill="#ecfdf5" stroke="{s}" stroke-width="2"/>
            <circle cx="20" cy="22" r="10" fill="{s}" fill-opacity="0.2"/>
            <text x="35" y="25" font-family="sans-serif" font-size="10.5" font-weight="800" fill="{s}">Zainab (Upstander):</text>
            <text x="12" y="48" font-family="sans-serif" font-size="10" font-weight="600" fill="#065f46">"Let's keep this space respectful."</text>
            <text x="12" y="64" font-family="sans-serif" font-size="9.5" fill="#047857">"Everyone has the right to contribute without</text>
            <text x="12" y="78" font-family="sans-serif" font-size="9.5" fill="#047857">being put down. This is an academic group."</text>
          </g>

          <!-- Peer Agreement Endorsements Below -->
          <g transform="translate(45, 225)">
            <rect x="0" y="0" width="180" height="30" rx="15" fill="#ffffff" stroke="{s}" stroke-width="1.2"/>
            <text x="20" y="20" font-family="sans-serif" font-size="11">👍 24</text>
            <text x="70" y="20" font-family="sans-serif" font-size="11">❤️ 16</text>
            <text x="120" y="20" font-family="sans-serif" font-size="11">👏 19</text>
          </g>
        </g>
        """
    else:
        # Scene 6: Digital Boundary Reset in Sunny Quad
        title = "Setting Healthy Digital Boundaries and Restoring Agency"
        art = f"""
        <!-- Sunny Campus Green Quadrangle Backdrop -->
        <circle cx="680" cy="110" r="40" fill="#fef08a" stroke="#fde047" stroke-width="3"/>
        <path d="M60 380 Q400 320 740 380 L740 430 L60 430 Z" fill="#86efac" fill-opacity="0.6"/>

        <!-- Shady Wooden Campus Park Bench -->
        <rect x="220" y="260" width="360" height="15" rx="3" fill="#92400e"/>
        <rect x="250" y="275" width="15" height="60" fill="#78350f"/>
        <rect x="530" y="275" width="15" height="60" fill="#78350f"/>

        <!-- Student Sitting Confidently on Bench Breathing Clean Air -->
        <g transform="translate(350, 140)">
          <circle cx="30" cy="30" r="22" fill="#fed7aa"/>
          <path d="M12 20 Q30 8 48 20 Z" fill="#0f172a"/>
          <rect x="10" y="52" width="40" height="85" rx="8" fill="{p}"/>
          <!-- Relaxed arms on lap -->
          <line x1="10" y1="75" x2="30" y2="105" stroke="#fed7aa" stroke-width="6"/>
          <line x1="50" y1="75" x2="30" y2="105" stroke="#fed7aa" stroke-width="6"/>
        </g>

        <!-- Phone Resting Face Down with "Do Not Disturb" Shield Icon Beside Student -->
        <g transform="translate(430, 240)" filter="url(#shadow)">
          <rect x="0" y="0" width="40" height="25" rx="4" fill="#0f172a"/>
          <circle cx="20" cy="12" r="8" fill="{s}"/>
          <text x="20" y="16" font-family="sans-serif" font-size="9" fill="#ffffff" text-anchor="middle">🌙</text>
        </g>

        <!-- Speech Thought Bubble Above: Peace of Mind -->
        <g transform="translate(260, 100)" filter="url(#shadow)">
          <rect x="0" y="0" width="150" height="34" rx="8" fill="#ffffff" stroke="{s}" stroke-width="1.8"/>
          <text x="75" y="21" font-family="sans-serif" font-size="10.5" font-weight="700" fill="{s}" text-anchor="middle">Boundaries Restored 🌿</text>
        </g>
        """

    return title, art, p, s, bg1, bg2

# ==============================================================================
# MAIN ENGINE
# ==============================================================================

THEME_DISPATCHER = {
    "mockery": ("Mockery &amp; Public Ridicule", get_mockery_scene),
    "exclusion": ("Social Exclusion &amp; Isolation", get_exclusion_scene),
    "private_info_leak": ("Confidential Info Leak", get_leak_scene),
    "false_rumour": ("False Rumour &amp; Misinformation", get_rumour_scene),
    "threats": ("Digital Intimidation &amp; Threats", get_threats_scene),
    "humiliating_content": ("Humiliating Visual Media", get_humiliating_scene),
    "general": ("Cyberbullying Awareness &amp; Safety", get_general_scene),
}

def generate_all():
    total = 0
    for theme_key, (theme_title, func) in THEME_DISPATCHER.items():
        theme_dir = BASE_DIR / theme_key
        theme_dir.mkdir(parents=True, exist_ok=True)

        for variant in range(1, 7):
            scene_title, scene_art, p, s, bg1, bg2 = func(variant)
            svg_content = build_svg_document(
                theme_title=theme_title,
                scene_title=scene_title,
                variant_num=variant,
                p_color=p,
                s_color=s,
                bg1=bg1,
                bg2=bg2,
                scene_elements=scene_art,
            )
            file_path = theme_dir / f"variant_{variant}.svg"
            file_path.write_text(svg_content.strip(), encoding="utf-8")
            
            # Strict XML parsing verification
            ET.parse(file_path)
            total += 1
            print(f"Generated & Verified [XML OK]: themes/{theme_key}/variant_{variant}.svg - {scene_title}")

    print(f"\nSUCCESS: Generated all {total} distinct vector illustrations across 7 themes (6 unique scenes each)!")

if __name__ == "__main__":
    generate_all()
