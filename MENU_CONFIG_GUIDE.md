# 📋 Menu Configuration Guide

## 📁 Location
`client/src/config/menuConfig.js`

## 🎯 Purpose
Centralized configuration for sidebar menu items with:
- Enable/disable menu items
- Role-based access control
- Easy maintenance
- Future-proof for user permissions

---

## 🔧 How to Use

### Hide a Menu Item
```javascript
// In menuConfig.js
loans: {
  enabled: false,  // ← Set to false to hide
  path: '/app/loans',
  label: 'Loans & EMIs',
  icon: 'CreditCard',
  roles: ['*'],
  order: 5
}
```

### Show Only to Specific Roles
```javascript
// In menuConfig.js
investments: {
  enabled: true,
  path: '/app/investments',
  label: 'Investments',
  icon: 'TrendingUp',
  roles: ['admin', 'premium'],  // ← Only these roles see it
  order: 6
}
```

### Change Menu Order
```javascript
// In menuConfig.js
groups: {
  enabled: true,
  path: '/app/groups',
  label: 'Groups',
  icon: 'Groups',
  roles: ['*'],
  order: 1  // ← Lower number = higher in menu
}
```

---

## 📝 Configuration Options

### Menu Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `enabled` | boolean | Show/hide menu item | `true` or `false` |
| `path` | string | Route path | `'/app/dashboard'` |
| `label` | string | Display text | `'Dashboard'` |
| `icon` | string | Icon name | `'Dashboard'` |
| `roles` | array | Allowed roles | `['*']` or `['admin', 'user']` |
| `order` | number | Display order | `1`, `2`, `3`... |

### Special Values

- **roles: ['*']** - All users can see this menu item
- **enabled: false** - Menu item is hidden for everyone
- **order** - Lower numbers appear first (1 = top, 9 = bottom)

---

## 🎨 Available Icons

| Icon Name | Visual | Usage |
|-----------|--------|-------|
| `Dashboard` | 📊 | Dashboard/Home |
| `Groups` | 👥 | Group expenses |
| `Receipt` | 🧾 | Expenses |
| `AccountBalance` | 🏦 | Income |
| `CreditCard` | 💳 | Loans/EMIs |
| `TrendingUp` | 📈 | Investments |
| `Handshake` | 🤝 | Lending |
| `Flag` | 🚩 | Budget/Goals |
| `Settings` | ⚙️ | Settings |

---

## 📋 Common Use Cases

### 1. Hide Feature During Development
```javascript
lending: {
  enabled: false,  // Hide until ready
  path: '/app/lending',
  label: 'Lending',
  icon: 'Handshake',
  roles: ['*'],
  order: 7
}
```

### 2. Admin-Only Features
```javascript
reports: {
  enabled: true,
  path: '/app/reports',
  label: 'Reports',
  icon: 'Assessment',
  roles: ['admin'],  // Only admins
  order: 10
}
```

### 3. Premium Features
```javascript
investments: {
  enabled: true,
  path: '/app/investments',
  label: 'Investments',
  icon: 'TrendingUp',
  roles: ['premium', 'admin'],  // Premium users only
  order: 6
}
```

### 4. Beta Features
```javascript
ai_insights: {
  enabled: true,
  path: '/app/ai-insights',
  label: 'AI Insights (Beta)',
  icon: 'Psychology',
  roles: ['beta_tester', 'admin'],
  order: 11
}
```

---

## 🔄 How It Works

### 1. Configuration File
```javascript
// menuConfig.js
export const menuConfig = {
  dashboard: { enabled: true, ... },
  groups: { enabled: true, ... }
};
```

### 2. Layout Component
```javascript
// Layout.jsx
import { getMenuItems } from '../../config/menuConfig';

const navItems = useMemo(() => {
  const userRole = user?.role || 'user';
  return getMenuItems(userRole);
}, [user?.role]);
```

### 3. Automatic Filtering
- Checks `enabled` flag
- Checks user role against `roles` array
- Sorts by `order` property
- Returns filtered menu items

---

## 🚀 Adding New Menu Items

### Step 1: Add to Config
```javascript
// menuConfig.js
export const menuConfig = {
  // ... existing items
  
  newFeature: {
    enabled: true,
    path: '/app/new-feature',
    label: 'New Feature',
    icon: 'Star',  // Choose from available icons
    roles: ['*'],
    order: 10
  }
};
```

### Step 2: Add Icon (if new)
```javascript
// Layout.jsx
import { Star as StarIcon } from '@mui/icons-material';

const iconMap = {
  // ... existing icons
  Star: StarIcon
};
```

### Step 3: Add Route
```javascript
// App.jsx
<Route path="new-feature" element={<NewFeature />} />
```

---

## 🎯 Examples

### Example 1: Free vs Premium
```javascript
// Free users see basic features
expenses: { enabled: true, roles: ['*'], ... }
income: { enabled: true, roles: ['*'], ... }

// Premium users see advanced features
investments: { enabled: true, roles: ['premium', 'admin'], ... }
lending: { enabled: true, roles: ['premium', 'admin'], ... }
```

### Example 2: Gradual Rollout
```javascript
// Phase 1: Only admins
newFeature: { enabled: true, roles: ['admin'], ... }

// Phase 2: Beta testers
newFeature: { enabled: true, roles: ['admin', 'beta'], ... }

// Phase 3: Everyone
newFeature: { enabled: true, roles: ['*'], ... }
```

### Example 3: Seasonal Features
```javascript
// Tax season feature
taxPlanning: {
  enabled: true,  // Enable during tax season
  path: '/app/tax-planning',
  label: 'Tax Planning',
  icon: 'Receipt',
  roles: ['*'],
  order: 9
}
```

---

## ✅ Best Practices

1. **Always set order** - Keeps menu organized
2. **Use descriptive labels** - Clear to users
3. **Test role access** - Verify permissions work
4. **Document changes** - Comment why disabled
5. **Keep roles simple** - Don't overcomplicate

---

## 🔒 Security Note

**Frontend hiding is NOT security!**

- Menu config only hides UI elements
- Always protect routes on backend
- Use proper authentication/authorization
- Frontend is for UX, backend is for security

---

## 📊 Current Configuration

```javascript
✅ Dashboard - All users, Order 1
✅ Groups - All users, Order 2
✅ Expenses - All users, Order 3
✅ Income - All users, Order 4
✅ Loans & EMIs - All users, Order 5
✅ Investments - All users, Order 6
✅ Lending - All users, Order 7
✅ Budget & Goals - All users, Order 8
✅ Settings - All users, Order 9
```

All features currently enabled for all users (`roles: ['*']`).

---

## 🎉 Benefits

✅ **Easy to maintain** - Single file to edit
✅ **No code changes** - Just config updates
✅ **Role-based access** - Future-proof for permissions
✅ **Quick toggles** - Enable/disable instantly
✅ **Organized** - Clear structure
✅ **Documented** - Self-explanatory config

---

## 🔄 Future Enhancements

Possible additions:
- Database-driven config
- User-specific customization
- Feature flags integration
- A/B testing support
- Analytics tracking
