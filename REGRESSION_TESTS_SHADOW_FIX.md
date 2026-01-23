# 🧪 Regression Testing - Shadow User Fix

**Purpose:** Ensure the shadow user linking fix doesn't break existing functionality  
**Date:** January 23, 2026  
**Status:** Pre-Deployment Verification

---

## ✅ Core Functionality Tests

### **1. Existing User Workflows (Should NOT be affected)**

#### **Test 1.1: Regular User Registration**
**Scenario:** New user registers (NOT added to any group beforehand)

**Steps:**
1. Register new user with phone: +911111111111
2. Login with same credentials
3. Check groups list

**Expected:**
- [ ] Registration successful
- [ ] Login successful
- [ ] Groups list is empty (no groups)
- [ ] `shadowUserLinking.groupsLinked` = 0
- [ ] No errors in console

**Why This Won't Break:**
- Linking function searches for matching phone/email in groups
- If no groups exist with that phone, nothing happens
- Returns `linkedGroupsCount: 0` gracefully

---

#### **Test 1.2: User Creates Group**
**Scenario:** Existing user creates a new group

**Steps:**
1. Login as existing user
2. Create group "Test Group"
3. Add 2 members (both registered users)
4. Verify group appears in list

**Expected:**
- [ ] Group created successfully
- [ ] All members added with real userIds
- [ ] Group appears in creator's list
- [ ] Group appears in members' lists

**Why This Won't Break:**
- Group creation logic unchanged
- Members added with real userIds (not shadow)
- `getUserGroups` finds by `members.userId` (line 137)

---

#### **Test 1.3: User Joins Existing Group**
**Scenario:** User B is added to group by User A (both already registered)

**Steps:**
1. User A creates group
2. User A adds User B by phone (User B already registered)
3. User B logs out and logs back in
4. Check if User B sees the group

**Expected:**
- [ ] User B sees the group immediately
- [ ] Member entry has User B's real userId
- [ ] No duplicate members created
- [ ] Login response shows: `shadowUserLinking.groupsLinked` >= 0

**Why This Won't Break:**
- When adding registered user, system finds them by phone
- Member created with real userId immediately
- Linking function checks `String(member.userId) !== String(userId)` (line 68)
- If userIds already match, no update happens (safe)

---

### **2. Group Queries (Critical)**

#### **Test 2.1: Get User's Groups**
**Scenario:** User has multiple groups (created, member, shadow-linked)

**Steps:**
1. User A creates "Group 1"
2. User B adds User A to "Group 2"
3. User C adds User A to "Group 3" (before User A registered - shadow)
4. User A logs in
5. Call GET /api/groups

**Expected:**
- [ ] All 3 groups returned
- [ ] No duplicates
- [ ] Correct member counts
- [ ] Correct balances

**Why This Won't Break:**
- `getUserGroups` uses multiple OR conditions:
  - `createdBy: userId` (finds Group 1)
  - `members.userId: userId` (finds Group 2 & 3 after linking)
- Linking updates shadow userId → real userId
- Query finds all groups correctly

---

#### **Test 2.2: Get Group Details**
**Scenario:** Fetch specific group with mixed member types

**Steps:**
1. Create group with:
   - User A (creator, registered)
   - User B (registered member)
   - User C (shadow member - not registered yet)
2. Call GET /api/groups/:id

**Expected:**
- [ ] Group details returned
- [ ] All 3 members shown
- [ ] User A & B have real userIds
- [ ] User C has shadow userId (hash)
- [ ] No errors

**Why This Won't Break:**
- Group model unchanged
- Members array can have mixed userId types
- Frontend handles both real and shadow members

---

### **3. Expense Tracking (Critical)**

#### **Test 3.1: Add Expense with Linked User**
**Scenario:** User was shadow, got linked, now adds expense

**Steps:**
1. User A adds User B to group (shadow)
2. User B registers (gets linked)
3. User B adds expense to group
4. User A views expense

**Expected:**
- [ ] Expense created successfully
- [ ] `paidBy` field has User B's real userId
- [ ] Expense shows "By User B" (or "By You" for User B)
- [ ] Splits calculated correctly

**Why This Won't Break:**
- After linking, User B's member.userId is real ObjectId
- Expense creation uses current user's real userId
- No shadow userId involved in expense creation

---

#### **Test 3.2: Expense Splits with Linked Members**
**Scenario:** Expense split among users who were shadow-linked

**Steps:**
1. Create group with 3 shadow members
2. All 3 register (get linked)
3. User A adds expense, splits equally
4. Check balances

**Expected:**
- [ ] Splits created for all 3 members
- [ ] Balances calculated correctly
- [ ] Settlement suggestions accurate
- [ ] No "Unknown" payers

**Why This Won't Break:**
- After linking, all members have real userIds
- Split logic uses member.userId
- Balance calculation uses userId matching
- Everything works with real ObjectIds

---

### **4. Edge Cases**

#### **Test 4.1: Duplicate Phone Numbers**
**Scenario:** Two users somehow have same phone (shouldn't happen but test anyway)

**Steps:**
1. User A: phone +919999999999
2. Try to register User B with same phone

**Expected:**
- [ ] Registration fails
- [ ] Error: "Phone number already exists"
- [ ] No linking conflicts

**Why This Won't Break:**
- User model has unique constraint on phone
- Registration validation prevents duplicates
- Linking only runs if registration succeeds

---

#### **Test 4.2: User Changes Phone Number**
**Scenario:** User updates their phone number

**Steps:**
1. User A registered with phone: +919999999999
2. User A added to groups
3. User A updates phone to: +918888888888
4. User A logs in

**Expected:**
- [ ] Phone update successful
- [ ] Existing groups still visible
- [ ] New groups with new phone get linked on next login

**Why This Won't Break:**
- Existing group memberships use userId (unchanged)
- `getUserGroups` finds by userId (line 137)
- New phone will link new groups on next login

---

#### **Test 4.3: Null/Empty Phone**
**Scenario:** User has email but no phone

**Steps:**
1. User A added to group by email only
2. User A registers with email (no phone)
3. User A logs in

**Expected:**
- [ ] Registration successful
- [ ] Linking works via email
- [ ] Group visible

**Why This Won't Break:**
- Linking checks both phone AND email
- Email matching works as fallback (line 53)
- Query handles null phone gracefully

---

### **5. Performance Tests**

#### **Test 5.1: Login Performance**
**Scenario:** User with many groups logs in

**Steps:**
1. Create user added to 50 groups
2. Measure login time before fix
3. Measure login time after fix
4. Compare

**Expected:**
- [ ] Login time increase < 200ms
- [ ] No timeout errors
- [ ] All groups loaded

**Why This Won't Break:**
- Linking query uses indexed fields (phone, email)
- Query is efficient (single find operation)
- Acceptable performance impact

---

#### **Test 5.2: Concurrent Logins**
**Scenario:** Multiple users login simultaneously

**Steps:**
1. Simulate 10 users logging in at same time
2. Check if all get correct groups
3. Check for race conditions

**Expected:**
- [ ] All users get correct groups
- [ ] No duplicate updates
- [ ] No database conflicts

**Why This Won't Break:**
- Each user's linking is independent
- MongoDB handles concurrent updates
- No shared state between users

---

## 🔍 Database Integrity Checks

### **Before Deployment:**
```javascript
// Check for orphaned shadow members
db.groups.find({
    "members.userId": { $type: "string", $regex: /^[a-f0-9]{24}$/ }
}).count()

// Check for null userIds
db.groups.find({
    "members.userId": null
}).count()
```

### **After Deployment:**
```javascript
// Verify all linked members have ObjectId userIds
db.groups.find({
    "members": {
        $elemMatch: {
            phone: { $exists: true },
            userId: { $type: "objectId" }
        }
    }
}).count()
```

---

## ✅ Rollback Verification

### **If Rollback Needed:**
1. [ ] Revert `shadowUserService.js` to previous version
2. [ ] Revert `authController.js` login changes
3. [ ] Test that old functionality still works
4. [ ] Verify no data corruption
5. [ ] Users can still login/register

---

## 📊 Success Criteria

- [ ] All existing user workflows work unchanged
- [ ] Group queries return correct results
- [ ] Expense tracking works with linked users
- [ ] No performance degradation
- [ ] No database errors
- [ ] Edge cases handled gracefully

---

## ⚠️ Known Safe Behaviors

### **What WILL Change (Expected):**
1. Shadow members get their userId updated (hash → ObjectId)
2. Login response includes `shadowUserLinking` field
3. Console logs show linking activity
4. Users see groups immediately after registration

### **What WON'T Change (Safe):**
1. Existing registered members - userId unchanged
2. Group creation - works as before
3. Expense tracking - uses real userIds
4. Balance calculations - unchanged
5. Settlement logic - unchanged

---

## 🚨 Red Flags to Watch For

### **During Testing:**
- ❌ User can't see groups they created
- ❌ Duplicate members in groups
- ❌ Expenses show "Unknown" payer
- ❌ Balances calculate incorrectly
- ❌ Login takes > 5 seconds
- ❌ Database errors in logs

### **If Any Red Flag Appears:**
1. Stop deployment immediately
2. Rollback changes
3. Investigate root cause
4. Re-test fix

---

## ✅ Final Checklist

**Before Going Live:**
- [ ] All regression tests pass
- [ ] No red flags observed
- [ ] Performance acceptable
- [ ] Database indexes created
- [ ] Rollback plan ready
- [ ] Monitoring in place

**Approved By:** _____________  
**Date:** _____________

---

**🎯 Goal: Fix shadow user bug WITHOUT breaking anything else!**
