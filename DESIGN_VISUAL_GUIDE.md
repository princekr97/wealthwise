# 🎨 WealthWise - Premium Fintech Design Guide

## Quick Visual Reference

### Color Usage Chart

```
┌─────────────────────────────────────────────────────────────┐
│  INCOME / POSITIVE                                          │
│  Primary: #10B981 (Emerald) → #06B6D4 (Cyan)              │
│  Gradient: linear-gradient(135deg, #10B981, #06B6D4)       │
│  Use for: Income cards, savings, positive metrics          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EXPENSES / NEGATIVE                                        │
│  Primary: #EF4444 (Red) → #FF6B6B (Coral)                 │
│  Gradient: linear-gradient(135deg, #FF6B6B, #FB7185)       │
│  Use for: Expense cards, costs, negative metrics           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CTAs & INTERACTIVE                                         │
│  Primary: #3B82F6 (Electric Blue)                          │
│  Use for: Buttons, links, active states                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  BACKGROUNDS                                                │
│  Primary: #0F172A (Rich Charcoal)                         │
│  Secondary: #1E293B (Slate)                               │
│  Cards: rgba(30, 41, 59, 0.95) with blur(12px)            │
└─────────────────────────────────────────────────────────────┘
```

### Typography Scale

```
Hero Numbers (Financial Amounts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
₹45,000     32-36pt  |  font-weight: 600
            letter-spacing: -0.02em

Section Headers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard   18-20pt  |  font-weight: 500

Body Text / Labels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Income  14-15pt  |  font-weight: 400
              letter-spacing: 0.3px
```

### Card Anatomy

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐   │ ← 24-32px padding
│  │                              │   │
│  │       💰  (28-32px icon)     │   │ ← 12px gap
│  │                              │   │
│  │      ₹45,000                 │   │ ← Hero number
│  │      (32-36pt, weight 600)   │   │
│  │                              │   │
│  │    TOTAL INCOME  ⓘ          │   │ ← Label (14-15pt)
│  │                              │   │
│  │      +5.2%                   │   │ ← Trend (optional)
│  │                              │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

Props:
- background: gradient overlay (5% opacity)
- backdropFilter: blur(12px)
- borderRadius: 18px
- shadow: 0px 8px 24px rgba(0,0,0,0.12)
- hover: translateY(-4px) + shadow enhancement
```

### Shadow Levels

```
Level 1 - Cards at Rest
━━━━━━━━━━━━━━━━━━━━━━
box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12),
            0px 2px 6px rgba(0, 0, 0, 0.08)

Level 2 - Cards on Hover
━━━━━━━━━━━━━━━━━━━━━━
box-shadow: 0px 16px 48px rgba(0, 0, 0, 0.16),
            0px 4px 12px rgba(0, 0, 0, 0.12)

Level 3 - Modals/Dialogs
━━━━━━━━━━━━━━━━━━━━━━
box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5)
```

### Interaction States

```
Default State
─────────────
transform: none
boxShadow: level 1

Hover State
───────────
transform: translateY(-4px) scale(1.01)
boxShadow: level 2
borderColor: increased opacity

Press/Active State
──────────────────
transform: translateY(-2px) scale(0.98)
duration: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Form Input Styling

```
┌────────────────────────────────────┐
│  Label                             │ ← #6B7280, white bg
├────────────────────────────────────┤
│  Input Value                       │ ← #0A0A0A text
│                                    │   #F9FAFB background
└────────────────────────────────────┘
     ↑
  Focus: #10B981 border (2px)
  Blur: rgba(16, 185, 129, 0.3) border
```

### Gradient Applications

```
Income Card Overlay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
background: linear-gradient(135deg, 
  rgba(16, 185, 129, 0.05) 0%, 
  rgba(6, 182, 212, 0.05) 100%)

Expense Card Overlay  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
background: linear-gradient(135deg, 
  rgba(255, 107, 107, 0.05) 0%, 
  rgba(251, 113, 133, 0.05) 100%)

Primary Button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
background: linear-gradient(135deg, 
  #10B981 0%, #06B6D4 100%)
boxShadow: 0 4px 20px rgba(16, 185, 129, 0.3)
```

### Spacing System

```
Card Padding
────────────
Mobile:  16-24px (2-3 * 8px)
Tablet:  24px    (3 * 8px)
Desktop: 24-32px (3-4 * 8px)

Card Gaps
─────────
Minimum: 12px
Standard: 16-20px
Generous: 24px

Icon-to-Text
────────────
Always: 12px minimum

Element Vertical Spacing
────────────────────────
Tight:   4-8px   (icon to text)
Standard: 12-16px (between sections)
Generous: 24-32px (major sections)
```

### Border Radius Guide

```
Cards:         18-20px  (premium rounded)
Buttons (CTA): 12px     (modern pill)
Inputs:        10px     (refined)
Chips/Badges:  20px     (full pill)
Tooltips:      8px      (subtle)
```

### Example: Dashboard Summary Card Code

```jsx
<SummaryCard
  icon="💰"
  label="Total Income"
  value={formatCurrency(45000)}
  valueColor="success"  // Uses emerald-cyan gradient
  trend="+5.2%"
  tooltip="Total earnings this month from all sources"
/>
```

Results in:
- Emerald-cyan gradient overlay (5% opacity)
- 28-32px icon
- ₹45,000 in 32-36pt, weight 600
- "TOTAL INCOME" label in 14-15pt with 0.3px letter spacing
- Info icon (16px) next to label
- Hover: lifts 4px + shadow enhancement

---

## Implementation Checklist

When creating new components:

- [ ] Use color gradients for semantic meaning
- [ ] Apply 18-20px border radius for cards
- [ ] Use 24-32px padding for breathing room
- [ ] Icons should be 28-32px for visibility
- [ ] Hero numbers: 32-36pt, weight 600, letter-spacing -0.02em
- [ ] Labels: 14-15pt, weight 400, letter-spacing 0.3px
- [ ] Add frosted glass: backdropFilter blur(12px)
- [ ] Implement lift hover: translateY(-4px) scale(1.01)
- [ ] Add ambient shadows: multi-layer with low opacity
- [ ] Use cubic-bezier(0.4, 0, 0.2, 1) for smooth easing

---

## Quick Color Reference

```javascript
// Import from theme
import { colors, gradients } from '../theme/muiTheme';

// Usage
colors.primary      // #10B981 (Emerald)
colors.primaryLight // #06B6D4 (Cyan)
colors.error        // #EF4444 (Red)
colors.errorLight   // #FF6B6B (Coral)
colors.accent       // #3B82F6 (Electric Blue)

gradients.income         // Emerald to Cyan
gradients.expense        // Coral to Rose
gradients.incomeSubtle   // 5% opacity income
gradients.expenseSubtle  // 5% opacity expense
gradients.primary        // Primary CTA gradient
```

---

**🎯 Goal**: Premium but approachable. Clean but not sterile. Spacious but information-rich.

**Reference Mood**: Revolut's card clarity + Apple Card's minimalism + Stripe's confident color use + N26's friendly data viz
