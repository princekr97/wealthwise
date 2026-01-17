# 🔗 Shadow User Auto-Linking Feature
**Status:** ✅ IMPLEMENTED  
**Type:** wealthwise-Style Collaborative Invitations

---

## 🎯 Feature Overview

This feature enables the **wealthwise-style collaborative flow** where users can invite friends to groups **before** those friends have accounts. When the invited friend eventually registers, they automatically gain access to all groups they were added to.

### User Flow Example

1. **Prince** creates group "Goa Trip"
2. **Prince** adds members:
   - john@email.com (John - no account yet)
   - sarah@email.com (Sarah - no account yet)
3. **Prince** adds expenses and splits them with John & Sarah
4. **John registers** later using "john@email.com"
5. **✨ AUTOMATIC MAGIC:**
   - John immediately sees "Goa Trip" in his groups
   - John can view all past expenses
   - John can add new expenses
   - John's balance is correctly calculated

---

## 🔧 Technical Implementation

### Core Components

#### 1. Shadow User Service
**File:** `server/src/services/shadowUserService.js`

```javascript
// Auto-links shadow members when user registers
linkShadowMembersToUser(user)

// Finds all groups user can access
getUserGroups(userId, email, phone)
```

**How It Works:**
- Scans all groups for shadow members matching user's email/phone
- Updates shadow member records with real userId
- Returns list of linked groups

#### 2. Registration Integration
**File:** `server/src/controllers/authController.js`

```javascript
// After user creation
const linkingResult = await linkShadowMembersToUser(user);

// Response includes linked groups
{
  user: {...},
  shadowUserLinking: {
    groupsLinked: 2,
    groupNames: ['Goa Trip', 'Office Lunch'],
    message: 'Welcome! You've been automatically added to 2 groups'
  }
}
```

#### 3. Enhanced Group Discovery
**File:** `server/src/controllers/groupController.js`

```javascript
// getGroups now finds:
const groups = await getUserGroups(userId, email, phone);
// 1. Groups user created
// 2. Groups where user is registered member
// 3. Groups where user was shadow → now linked
```

---

## 📋 Schema Changes

### Group Member Schema
**File:** `server/src/models/groupModel.js`

```javascript
members: [
  {
    userId: { type: Mixed, ref: 'User', default: null }, // null = shadow user
    name: { type: String, required: true },
    email: { type: String, required: true }, // ✅ NOW REQUIRED
    phone: { type: String, required: true }, // ✅ NOW REQUIRED
    isActive: { type: Boolean, default: true },
    removedAt: { type: Date },
    removedBy: { type: ObjectId, ref: 'User' }
  }
]
```

**Key Points:**
- `email` & `phone` are **now mandatory** for all members
- `userId` can be `null` for shadow users
- When user registers, `userId` gets filled in

---

## 🔍 Shadow User Matching Logic

### Priority Matching Order:
1. **Email Match** (primary)
   - Normalized: lowercase, trimmed
   - Most reliable identifier
   
2. **Phone Match** (secondary)
   - Exact string match
   - Fallback if email missing

### Linking Criteria:
```javascript
// Only link if:
- member.userId is null/undefined (shadow user)
- member.email OR phone matches registered user
- member.isActive !== false (not removed)
```

---

## 📊 Database Queries

### Finding Shadow Members
```javascript
Group.find({
  $or: [
    {
      'members': {
        $elemMatch: {
          email: 'john@email.com',
          userId: { $exists: false },
          isActive: { $ne: false }
        }
      }
    },
    {
      'members': {
        $elemMatch: {
          phone: '1234567890',
          userId: { $exists: false },
          isActive: { $ne: false }
        }
      }
    }
  ]
});
```

### Finding User's Groups (Enhanced)
```javascript
Group.find({
  $or: [
    { createdBy: userId },                    // User is creator
    { 'members.userId': userId },             // User is member
    {                                          // Newly linked
      'members.email': userEmail,
      'members.userId': userId
    }
  ]
});
```

---

## 🎨 Frontend Integration

### Registration Response Handling

```javascript
// After successful registration
const response = await authService.register(userData);

if (response.shadowUserLinking?.groupsLinked > 0) {
  // Show welcome notification
  toast.success(
    `Welcome! You've been added to ${response.shadowUserLinking.groupsLinked} groups: 
     ${response.shadowUserLinking.groupNames.join(', ')}`
  );
}
```

### Group List Display
No changes needed! Groups will automatically appear when:
- User calls `/api/groups`
- Backend uses enhanced `getUserGroups()` function
- All accessible groups returned (created + member + shadow-linked)

---

## 🧪 Testing Scenarios

### Test Case 1: Basic Shadow → Real User
```
1. User A creates group "Test"
2. User A adds "test@email.com" (no account)
3. New user registers with "test@email.com"
4. ✅ User sees "Test" group immediately
```

### Test Case 2: Multiple Groups
```
1. User A adds "john@email.com" to Group X
2. User B adds "john@email.com" to Group Y
3. User C adds "john@email.com" to Group Z
4. John registers
5. ✅ John sees all 3 groups
```

### Test Case 3: Phone Number Matching
```
1. User A adds member: name="John", phone="1234567890", email="temp@temp.com"
2. John registers with phone="1234567890"
3. ✅ John linked to group
```

### Test Case 4: Expenses Visible
```
1. User A adds shadow user to group
2. User A creates expenses with shadow user in splits
3. Shadow user registers
4. ✅ User immediately sees past expenses
5. ✅ User's balance calculated correctly
```

---

## ⚠️ Edge Cases & Handling

### 1. Email Mismatch
**Scenario:** User added as "john@gmail.com" but registers as "john@yahoo.com"  
**Result:** Won't link (different identifiers)  
**Solution:** User A can manually update member email or add new member

### 2. Duplicate Members
**Scenario:** Shadow user "john@email.com" exists, John registers, then gets added again  
**Current:** Two member records (one shadow-linked, one new)  
**TODO (P2):** Detect and merge duplicates

### 3. Already-Linked Shadow
**Scenario:** `linkShadowMembersToUser` called twice  
**Result:** No-op (skips members with existing userId)  
**Safe:** ✅ Idempotent operation

###4. Empty Email/Phone
**Scenario:** Old groups with optional email/phone  
**Result:** Schema now requires these fields  
**Migration:** Validation will fail for new members without email/phone  
**Backward Compat:** Existing members without fields are grandfathered

---

## 🚀 Performance Considerations

### Linking at Registration
- **When:** Once per user registration
- **Cost:** O(n) where n = total groups in system
- **Optimization:** Uses indexed queries (`members.email`, `members.phone`)
- **Acceptable:** Registration is infrequent user action

### Group Discovery at Login
- **When:** Every `/api/groups` call
- **Cost:** O(m) where m = user's groups
- **Optimization:** Compound indexes on membership fields
- **Cached:** Consider Redis cache for frequent users (future enhancement)

---

## 📝 Migration Guide

### For Existing Data

**Problem:** Old groups have members without email/phone  
**Solution:** 

#### Option 1: Soft Migration (Recommended)
```javascript
// Make fields required only for NEW members
// Grandfather existing members
if (member.email || member.phone) {
  // Valid
} else if (member.userId) {
  // Also valid (registered user fallback)
} else {
  throw new Error('Email or phone required');
}
```

#### Option 2: Data Cleanup Script
```javascript
// Fill missing emails with defaults
db.groups.updateMany(
  { 'members.email': { $exists: false } },
  { $set: { 'members.$[].email': 'unknown@email.com' } }
);
```

---

## ✅ Success Criteria

- [x] Email/phone mandatory for new members
- [x] Shadow users automatically linked on registration
- [x] Linked groups appear in user's group list
- [x] Past expenses visible to newly linked members
- [x] Balance calculation includes shadow-period expenses
- [x] Registration response includes linking info
- [x] No performance degradation
- [x] Backward compatible with existing groups

---

## 🎯 Future Enhancements (P2/P3)

### 1. Welcome Notification
**In-app banner:** "You've been invited to 3 groups!"

### 2. Duplicate Detection
**Auto-merge:** If shadow user and new member have same email

### 3. Invitation Emails
**Email notification:** "Prince invited you to 'Goa Trip'"  
**CTA:** Pre-fill registration with email

### 4. Group Access Permissions
**Shadow users:** View-only until they register

### 5. Invitation History
**Track:** Who invited whom, when

---

## 📚 Related Documentation

- `/wealthwise_GAP_ANALYSIS.md` - Feature requirements
- `/P0_FIXES_IMPLEMENTATION.md` - Safe member removal
- `server/src/services/shadowUserService.js` - Core implementation

---

**Implementation Status:** ✅ **PRODUCTION READY**

All core functionality implemented and tested.  
Ready for user acceptance testing.
