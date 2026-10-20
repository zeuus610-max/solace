# 🎨 SOLACE — Figma Design System & UI Specification

> **File:** `Figma: SOLACE Design System v2.4`  
> **Visual Direction:** Ranvel-inspired Cinematic Dark Theme · High-Contrast Orange Accents · 3D Glassmorphism Cards  

---

## 1. Color Palette Tokens

```
Primary Background:      #050505  [Black 950]
Secondary Background:    #0A0A0A  [Black 900]
Card Surface:            #111111  [Gray 900]
Elevated Hover Surface:  #1A1A1A  [Gray 850]
Input Surface:           #0D0D0D  [Gray 925]

Primary Brand Accent:    #F97316  [Orange 500]
Hover Glow Accent:       #FB923C  [Orange 400]
Gradient Stop Dark:      #EA580C  [Orange 600]
Accent Shadow Glow:      rgba(249, 115, 22, 0.25)

Verdict Safe:            #22C55E  [Green 500]  | Surface: rgba(34, 197, 94, 0.1)
Verdict Suspicious:      #EAB308  [Yellow 500] | Surface: rgba(234, 179, 8, 0.1)
Verdict Phishing:        #EF4444  [Red 500]    | Surface: rgba(239, 68, 68, 0.1)

Text Primary:            #FAFAFA  [White]
Text Secondary:          #A3A3A3  [Gray 400]
Text Muted:              #525252  [Gray 600]
Border Default:          #1E1E1E  [Gray 800]
Border Hover:            #333333  [Gray 700]
```

---

## 2. Typography Hierarchy

| Style Level | Font Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| **Display (Hero)** | Inter / Sora | 48px – 80px | 900 (Black) | 1.05 | -0.03em |
| **Heading 1 (Sections)**| Inter | 32px – 48px | 800 (ExtraBold) | 1.15 | -0.02em |
| **Heading 2 (Subsections)**| Inter | 24px – 36px | 700 (Bold) | 1.20 | -0.01em |
| **Heading 3 (Card Titles)**| Inter | 20px | 600 (SemiBold) | 1.30 | 0.00em |
| **Body (Default)** | Inter | 16px | 400 (Regular) | 1.70 | 0.00em |
| **Small / Caption** | Inter | 14px | 400 (Regular) | 1.50 | 0.00em |
| **Code / URL Token** | JetBrains Mono | 13px – 14px | 500 (Medium) | 1.40 | -0.01em |

---

## 3. UI Components

### 1. Navigation Bar
* **Height:** 72px fixed
* **Glassmorphic state:** `background: rgba(10, 10, 10, 0.8)`, `backdrop-filter: blur(20px)`
* **Items:** Brand logo (36x36 3D emblem) + wordmark "SOLACE", links with hover pill highlight, CTA button with orange gradient.

### 2. Verdict Gauge Ring
* **Render:** 200px x 200px Chart.js doughnut with cutout `78%`
* **Center typography:** 48px ExtraBold percentage (`0% – 100%`) + 12px uppercase label `RISK SCORE`
* **Color state:** Green (`#22C55E`) if <45%, Yellow (`#EAB308`) if 45–74%, Red (`#EF4444`) if >=75%.

### 3. URL Breakdown Chips
* **Shape:** Full pill radius (`border-radius: 9999px`)
* **Components:** 
  * Micro-label: 11px uppercase bold in `#525252`
  * Value: JetBrains Mono in `#FAFAFA`

### 4. Interactive Charts
* **Summary Pie:** Chart.js Doughnut with 65% cutout, displaying corpus distribution.
* **Feature Importance:** Horizontal bar chart with rounded bar caps (`borderRadius: 6px`) and stepped orange transparency levels.
