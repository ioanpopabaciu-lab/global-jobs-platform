# GJC Design System v2.0

## Overview
Design system-ul platformei Global Jobs Consulting, actualizat pentru o identitate vizuală profesională și modernă.

---

## Fonts

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
```

### Font Families
| Usage | Font | Weights |
|-------|------|---------|
| **Headings (H1-H6)** | Sora | 400, 600, 700, 800 |
| **Body, Labels, Buttons** | Inter | 400, 500, 600 |

### CSS Variables
```css
--font-heading: 'Sora', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Tailwind Classes
```html
<h1 class="font-heading">Heading</h1>
<p class="font-body">Body text</p>
```

---

## Colors

### Brand Palette
| Name | HEX | Usage |
|------|-----|-------|
| **Primary (Navy)** | `#1E3A8A` | Titluri, header, links |
| **CTA Green** | `#10B981` | Butoane principale |
| **CTA Hover** | `#059669` | Hover state butoane |
| **Text Dark** | `#1F2937` | Text principal |
| **Text Grey** | `#6B7280` | Text secundar |
| **Background** | `#F9FAFB` | Fundal pagini |
| **White** | `#FFFFFF` | Carduri, secțiuni |
| **Accent** | `#F97316` | Highlight-uri |
| **Border** | `#E5E7EB` | Borduri subtile |
| **Navy Light** | `#EFF6FF` | Fundal secțiuni |

### CSS Variables
```css
--color-primary: #1E3A8A;
--color-cta-green: #10B981;
--color-cta-hover: #059669;
--color-text-dark: #1F2937;
--color-text-grey: #6B7280;
--color-background: #F9FAFB;
--color-white: #FFFFFF;
--color-accent: #F97316;
--color-border: #E5E7EB;
--color-navy-light: #EFF6FF;
```

### Tailwind Classes
```html
<div class="bg-gjc-primary text-white">Navy background</div>
<button class="bg-gjc-cta hover:bg-gjc-cta-hover">Green CTA</button>
<p class="text-gjc-text-dark">Dark text</p>
<p class="text-gjc-text-grey">Grey text</p>
<span class="text-gjc-accent">Orange highlight</span>
<section class="bg-gjc-navy-light">Light blue section</section>
```

---

## Typography

### Scale
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| **H1** | Sora | 56px | 700 (Bold) | 1.15 |
| **H2** | Sora | 40px | 700 (Bold) | 1.2 |
| **H3** | Sora | 28px | 600 (SemiBold) | 1.3 |
| **H4** | Sora | 20px | 600 (SemiBold) | 1.4 |
| **Body Large** | Inter | 18px | 400 | 1.7 |
| **Body** | Inter | 16px | 400 | 1.6 |
| **Small** | Inter | 14px | 400 | 1.5 |
| **Caption** | Inter | 12px | 400 | 1.4 |

### Responsive Breakpoints
```css
@media (max-width: 768px) {
    h1 { font-size: 36px; }
    h2 { font-size: 28px; }
    h3 { font-size: 22px; }
    h4 { font-size: 18px; }
}
```

### Tailwind Classes
```html
<h1 class="text-h1 font-heading">Main Title</h1>
<h2 class="text-h2 font-heading">Section Title</h2>
<p class="text-body-lg">Large body text</p>
<p class="text-body">Normal body text</p>
<span class="text-small">Small text</span>
<span class="text-caption">Caption text</span>
```

---

## Buttons

### Primary Button (Green CTA)
```jsx
<Button variant="default">Începe acum</Button>
```
| Property | Value |
|----------|-------|
| Background | `#10B981` |
| Text | `#FFFFFF` |
| Font | Inter SemiBold 16px |
| Padding | 14px 28px |
| Border Radius | 8px |
| Hover | `#059669` + shadow |
| Transition | 0.2s ease |

### Secondary Button (Navy Outline)
```jsx
<Button variant="secondary">Află mai multe</Button>
```
| Property | Value |
|----------|-------|
| Background | transparent |
| Border | 2px solid `#1E3A8A` |
| Text | `#1E3A8A` |
| Font | Inter SemiBold 16px |
| Padding | 12px 26px |
| Border Radius | 8px |
| Hover | background `#EFF6FF` |

### Ghost Button (Link Style)
```jsx
<Button variant="ghost">Vezi detalii</Button>
```
| Property | Value |
|----------|-------|
| Background | transparent |
| Text | `#1E3A8A` |
| Font | Inter Medium 15px |
| Hover | underline |

### Size Variants
```jsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### CSS Classes (Alternative)
```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-ghost">Ghost</button>
<button class="btn-primary btn-lg">Large Primary</button>
```

---

## Spacing

### 8px Grid System
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 8px | Minimal gaps |
| `sm` | 16px | Small gaps, padding |
| `md` | 24px | Medium gaps, card padding |
| `lg` | 32px | Large gaps |
| `xl` | 48px | Section padding |
| `2xl` | 64px | Large section padding |
| `3xl` | 96px | Section vertical spacing |

### CSS Variables
```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
--space-3xl: 96px;
```

### Tailwind Classes
```html
<div class="p-md gap-sm">Content</div>
<section class="py-3xl">Section</section>
```

---

## Shadows

### Shadow Tokens
| Name | Value | Usage |
|------|-------|-------|
| **Card** | `0 1px 3px rgba(0,0,0,0.1)` | Default cards |
| **Hover** | `0 8px 25px rgba(0,0,0,0.12)` | Hover state |
| **Modal** | `0 20px 60px rgba(0,0,0,0.15)` | Modals, dialogs |
| **Button** | `0 4px 14px rgba(16,185,129,0.35)` | CTA buttons |

### CSS Variables
```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.1);
--shadow-hover: 0 8px 25px rgba(0,0,0,0.12);
--shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
--shadow-button: 0 4px 14px rgba(16,185,129,0.35);
```

### Tailwind Classes
```html
<div class="shadow-card hover:shadow-card-hover">Card</div>
<div class="shadow-modal">Modal</div>
```

---

## Components

### Card
```html
<div class="gjc-card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```
```css
.gjc-card {
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
    padding: var(--space-md);
}
```

### Section
```html
<section class="gjc-section gjc-section-navy">
  <div class="gjc-container">
    Content...
  </div>
</section>
```

### Input
```html
<label class="gjc-label">Email</label>
<input class="gjc-input" type="email" placeholder="email@example.com" />
```

---

## Animations

### Available Animations
| Class | Description |
|-------|-------------|
| `animate-slide-up` | Slide up with fade |
| `animate-slide-down` | Slide down with fade |
| `animate-slide-left` | Slide left with fade |
| `animate-slide-right` | Slide right with fade |
| `animate-fade-in` | Simple fade in |
| `animate-scale-in` | Scale up with fade |
| `animate-pulse-glow` | Pulsing glow effect |

### Stagger Animation
```html
<div class="animate-fade-in stagger-1">Item 1</div>
<div class="animate-fade-in stagger-2">Item 2</div>
<div class="animate-fade-in stagger-3">Item 3</div>
```

---

## Usage Examples

### Hero Section
```jsx
<section className="bg-gjc-primary py-3xl">
  <div className="gjc-container">
    <h1 className="font-heading text-h1 text-white">
      Global Jobs Consulting
    </h1>
    <p className="text-body-lg text-white/80 mt-md">
      Conectăm talentele cu oportunitățile
    </p>
    <div className="flex gap-sm mt-xl">
      <Button variant="default" size="lg">
        Începe acum
      </Button>
      <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white/10">
        Află mai multe
      </Button>
    </div>
  </div>
</section>
```

### Feature Card
```jsx
<div className="gjc-card hover:shadow-card-hover transition-shadow">
  <div className="w-12 h-12 bg-gjc-navy-light rounded-lg flex items-center justify-center mb-md">
    <Icon className="text-gjc-primary" />
  </div>
  <h3 className="font-heading text-h4 text-gjc-primary mb-sm">
    Feature Title
  </h3>
  <p className="text-body text-gjc-text-grey">
    Feature description goes here...
  </p>
</div>
```

### Form
```jsx
<form className="space-y-md">
  <div>
    <label className="gjc-label">Email</label>
    <input className="gjc-input" type="email" />
  </div>
  <div>
    <label className="gjc-label">Mesaj</label>
    <textarea className="gjc-input" rows={4} />
  </div>
  <Button type="submit">Trimite</Button>
</form>
```

---

## File Locations
- **CSS Variables:** `/app/frontend/src/index.css`
- **Tailwind Config:** `/app/frontend/tailwind.config.js`
- **Button Component:** `/app/frontend/src/components/ui/button.jsx`

---

**GJC Design System v2.0**  
*Last updated: March 2026*
