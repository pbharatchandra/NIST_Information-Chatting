# 🎨 Visual Guide - New Features & Pages

## Overview of New UI/UX Features

---

## 1. Profile Page (`/profile.html`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  NIST    [🔍 Search] [💬] [👤] [📄] [🎓] [🚪]      │  ← Navigation
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Users List   │  ┌──────────────────────────────┐   │
│              │  │  ⭕ Bharat Chandra           │   │
│ - User 1     │  │  Student                     │   │
│ - User 2     │  │  Last updated: Today         │   │
│ - User 3     │  └──────────────────────────────┘   │
│              │                                      │
│              │  📋 Basic Information                │
│              │  ┌──────────────────────────────┐   │
│              │  │ Full Name: [______________]  │   │
│              │  │ Email: student@nist.edu      │   │
│              │  │ Phone: [______________]      │   │
│              │  │ Location: [______________]   │   │
│              │  └──────────────────────────────┘   │
│              │                                      │
│              │  🎓 Academic Information            │
│              │  ┌──────────────────────────────┐   │
│              │  │ Roll Number: [__________]    │   │
│              │  │ Batch: [______________]      │   │
│              │  │ Skills: [______________]     │   │
│              │  └──────────────────────────────┘   │
│              │                                      │
│              │  💾 Save Changes  ← Back to Chat    │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Color Scheme
- Avatar: Green gradient (#25D366 → #128C7E)
- Form sections: Light gray (#F5F5F5)
- Buttons: Primary green (#25D366)
- Text: Dark (#111111)
- Borders: Light gray (#E0E0E0)

---

## 2. Documents Page (`/documents.html`)

### Faculty View (Upload Section)
```
┌─────────────────────────────────────────────────────┐
│  NIST    [🔍] [💬] [👤] [📄] [🎓] [🚪]            │  ← Navbar
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Categories   │  📤 Upload Course Materials          │
│              │  ┌──────────────────────────────┐   │
│ - All Docs   │  │  📁 Drag & drop files here   │   │
│ - Notes      │  │        or click to browse     │   │
│ - Assignments│  │                              │   │
│ - Resources  │  │  Supported: PDF, DOC, etc.   │   │
│ - Papers     │  └──────────────────────────────┘   │
│              │                                      │
│              │  📋 Filters & Search                │
│              │  [All] [PDF] [Docs] [Presentations] │
│              │  [🔍 Search documents...]           │
│              │                                      │
│              │  📚 Documents List                   │
│              │  ┌──────────────────────────────┐   │
│              │  │ 📕 Data Structures - Lect.pdf│   │
│              │  │ Dr. Sharma | 2.5 MB          │   │
│              │  │ [⬇️ Download] [📤 Share]     │   │
│              │  ├──────────────────────────────┤   │
│              │  │ 📘 Assignment 1 - Trees.pdf  │   │
│              │  │ Dr. Sharma | 1.2 MB          │   │
│              │  │ [⬇️ Download] [📤 Share]     │   │
│              │  └──────────────────────────────┘   │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Student View (Download Only)
```
Same layout but without upload section and share buttons.
Only [⬇️ Download] button available.
```

---

## 3. Alumni Network Page (`/alumni.html`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  NIST    [🔍 Search] [💬] [👤] [📄] [🎓] [🚪]      │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Navigation   │  📊 Statistics                       │
│              │  ┌──────────────────────────────┐   │
│ - All Alumni │  │ 5 Total │ 2 Hiring │ 1 Seek │   │
│ - Hiring Open│  │ 3 Companies Represented       │   │
│ - Job Seek   │  └──────────────────────────────┘   │
│ - Mentors    │                                      │
│              │  🔍 Filters                          │
│              │  [Company: ________] [Year: ____]    │
│              │  [Sort: By Name ▼]                   │
│              │                                      │
│              │  👥 Alumni Cards Grid                │
│              │  ┌─────────────┬──────────────────┐  │
│              │  │ ⭕ Rajesh   │ 📕 Priya Singh   │  │
│              │  │ 2020        │ 2021             │  │
│              │  │             │                  │  │
│              │  │ 💼 Google   │ 💼 Microsoft     │  │
│              │  │ Sr. Engineer│ Product Manager  │  │
│              │  │             │                  │  │
│              │  │ Skills:     │ Skills:          │  │
│              │  │ Python, Go  │ Strategy, Data   │  │
│              │  │             │                  │  │
│              │  │ [💬] [🎯]   │ [💬] [🎯]        │  │
│              │  │ Message Refer│ Message Refer    │  │
│              │  └─────────────┴──────────────────┘  │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Referral Modal
```
┌─────────────────────────────────┐
│ Request Job Referral          ✕ │
├─────────────────────────────────┤
│ Your Name: [John Doe]           │
│                                 │
│ Position: [Software Engineer]   │
│                                 │
│ Message:                        │
│ [I'm very interested in joining │
│  your team. I have experience   │
│  with Python and Go...]         │
│                                 │
│ [Send Request]  [Cancel]        │
└─────────────────────────────────┘
```

---

## 4. Dashboard Navigation Update

### Before (Old)
```
[📚 Student Dashboard]
[User Name]  [Logout]
```

### After (New)
```
[📚 Student Dashboard]
[User Name]  [👤] [📄] [🎓] [🚪 Logout]
```

### Icon Meanings
- 👤 Profile - Go to profile page
- 📄 Documents - Browse/upload documents
- 🎓 Alumni - View alumni network
- 🚪 Logout - Sign out

---

## 5. Profile Form Sections

### Basic Information
```
┌────────────────────────────────┐
│ 👤 Basic Information           │
├────────────────────────────────┤
│ Full Name: [______________]    │
│ Email: [______________] (read) │
│                                │
│ Phone: [______________]        │
│ Location: [______________]     │
└────────────────────────────────┘
```

### Professional Information
```
┌────────────────────────────────┐
│ 🎓 Professional Information    │
├────────────────────────────────┤
│ Department: [______________]   │
│                                │
│ Bio:                           │
│ [________________________]      │
│ [________________________]      │
└────────────────────────────────┘
```

### Student Specific
```
┌────────────────────────────────┐
│ 🎯 Academic & Career Info     │
├────────────────────────────────┤
│ Roll Number: [__________]      │
│ Batch: [__________]            │
│                                │
│ Skills:                        │
│ [________________________]      │
│                                │
│ For Alumni:                    │
│ Company: [______________]      │
│ Job Title: [______________]    │
│ LinkedIn: [______________]     │
│                                │
│ Open to referrals?             │
│ (•) Yes  ( ) No                │
└────────────────────────────────┘
```

### Faculty Specific
```
┌────────────────────────────────┐
│ 📚 Faculty Information         │
├────────────────────────────────┤
│ Qualifications:                │
│ [________________________]      │
│                                │
│ Research Interests:            │
│ [________________________]      │
│                                │
│ Office Hours:                  │
│ [________________________]      │
│ e.g., Mon 2-4 PM, Wed 3-5 PM   │
└────────────────────────────────┘
```

---

## 6. Document Categories

### Sidebar Categories
```
📄 All Documents
  ├─ 📝 Class Notes
  ├─ ✏️ Assignments
  ├─ 📚 Resources
  └─ 📰 Research Papers
```

### File Types
```
PDF Files       → 📕
Word Docs       → 📘
Presentations   → 🎨
Spreadsheets    → 📊
Archives        → 📦
```

---

## 7. Alumni Filters & Sorting

### Filter Options
```
[Company: ____________]  (Type to filter)
[Year: ______]         (Enter graduation year)

Sort By:
▼ By Name
  By Company
  Recently Active
```

### Tabs
```
| 👥 All Alumni | 🎯 Hiring | 🔍 Job Seeking | 🎓 Mentors |
```

---

## 8. Color Reference

### WhatsApp-Inspired Palette
```
Primary Green       #25D366    ███
Dark Green          #128C7E    ███
Light Green (sent)  #DCF8C6    ███
Light Gray (recv)   #E7E7EB    ███
White Background    #FFFFFF    ███
Dark Text           #111111    ███
Light Text          #54656F    ███
Border Gray         #E0E0D0    ███
Online Indicator    #31A24C    ███
```

---

## 9. Responsive Design

### Desktop (1200px+)
```
┌────────────────────────────────────┐
│ Navbar                              │
├─────────────┬──────────────────────┤
│  Sidebar    │  Main Content Area   │
│  (250px)    │  (Full width)        │
│             │                      │
└─────────────┴──────────────────────┘
```

### Tablet (768px - 1199px)
```
┌────────────────────────────┐
│ Navbar                      │
├──────────┬─────────────────┤
│ Sidebar  │ Content Area    │
│(180px)   │ (Adjusted)      │
└──────────┴─────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│ Navbar (Hamburger)   │
├──────────────────────┤
│                      │
│ Content (Full Width) │
│                      │
├──────────────────────┤
│ Mobile Navigation    │
└──────────────────────┘
```

---

## 10. Form Styling

### Input Fields
```
Text Input:
[____________________________]  Border: Light gray
 ↓ On Focus:
[____________________________]  Border: Green (#25D366)
 ↓ With Shadow:
[____________________________]  + Light green shadow

Textarea:
[_____________________________]
[_____________________________]
[_____________________________]

Radio Button:
(•) Option 1    (o) Option 2

Checkbox:
☑ Agree to terms
```

---

## 11. Buttons & CTA

### Primary Button
```
Background: Green (#25D366)
Text: White
Padding: 12px 20px
Border Radius: 8px
Hover: Darker green (#128C7E)

💾 Save Changes
```

### Secondary Button
```
Background: Light gray (#F5F5F5)
Text: Dark (#111111)
Border: 1px solid #E0E0D0
Padding: 12px 20px
Hover: Border becomes green

← Back to Chat
```

### Icon Buttons
```
Small size (40px circle)
Hover effect (semi-transparent background)

[📤]  [⬇️]  [🎯]  [💬]  [✕]
```

---

## 12. Cards & Components

### User Profile Card
```
┌─────────────────────────┐
│  ⭕ Avatar               │
│  Name: Rajesh Kumar     │
│  Batch: 2020            │
│  💼 Google              │
│  Sr. Software Engineer  │
│                         │
│  Skills: Python, Go     │
│                         │
│  [💬] [🎯 Refer]        │
└─────────────────────────┘
```

### Document Card
```
┌────────────────────────────┐
│  📕                        │
│  Lecture 1.pdf             │
│  Dr. Sharma | 2.5 MB       │
│                            │
│  [⬇️ Download] [📤 Share]  │
└────────────────────────────┘
```

### Stat Box
```
┌──────────┐
│  5       │  Total Alumni
└──────────┘
```

---

## 13. Animations

### Slide In (Messages, Cards)
```
Transition: 0.3s ease-out
From: opacity 0, translateY(10px)
To: opacity 1, translateY(0)
```

### Hover Effects
```
Cards: translateY(-2px), shadow increases
Buttons: background color change
Icons: slight scale (1.2x)
```

### Loading State
```
Bouncing dots animation:
●  ●  ●  (continuous bounce)
```

---

## 14. Modal Dialogs

### Share Modal
```
┌──────────────────────────────┐
│ Share Document            ✕  │
├──────────────────────────────┤
│ Share "Lecture 1.pdf" with:  │
│                              │
│ ☑ All Students               │
│ ○ Specific Groups            │
│ ○ Individual Students        │
│                              │
│ [Share]  [Cancel]            │
└──────────────────────────────┘
```

### Profile Modal
```
┌──────────────────────────────┐
│ Profile                   ✕  │
├──────────────────────────────┤
│          ⭕                   │
│      Rajesh Kumar            │
│      Senior Engineer         │
│      Google, India           │
│                              │
│ [💬 Message]                 │
└──────────────────────────────┘
```

---

## 15. Summary View

### Desktop Dashboard Layout
```
┌─────────────────────────────────────────────┐
│ NIST [🔍] [💬] [👤] [📄] [🎓] [🚪]        │ ← Header
├───────────┬─────────────────────────────────┤
│  Sidebar  │  Main Chat Area                │
│  (25%)    │                                │
│           │  [User Name at Top]            │
│  - Online │  ┌────────────────────────────┐│
│  - Chat 1 │  │ Message 1 (Received)      ││
│  - Chat 2 │  ├────────────────────────────┤│
│  - Chat 3 │  │ Message 2 (Sent)          ││
│           │  ├────────────────────────────┤│
│           │  │ Message 3 (Received)      ││
│           │  └────────────────────────────┘│
│           │                                │
│           │  [Type message...] [Send]      │
│           │                                │
└───────────┴─────────────────────────────────┘
```

---

## Key Design Decisions

✅ **Colors**: WhatsApp green (#25D366) for recognition
✅ **Typography**: Sans-serif for modern look
✅ **Spacing**: 8px grid for consistency
✅ **Icons**: Emoji for universal understanding
✅ **Responsive**: Works on all devices
✅ **Accessibility**: High contrast, semantic HTML
✅ **Performance**: Optimized CSS and JS
✅ **Animations**: Smooth, not distracting

---

**All pages follow this consistent design system for a cohesive, professional experience.**
