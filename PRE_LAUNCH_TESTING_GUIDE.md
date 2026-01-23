# 🚀 Pre-Launch Testing Guide - WealthWise Groups Feature

**Testing Date:** January 23, 2026  
**Version:** Production Launch v1.0  
**Tester:** _____________  
**Environment:** Production

---

## 📋 Testing Checklist Overview

- [ ] **P0 Critical Tests** (Must Pass - App Breaking)
- [ ] **P1 High Priority Tests** (Core Functionality)
- [ ] **P2 Medium Priority Tests** (User Experience)
- [ ] **Edge Cases & Error Handling**

---

## 🎯 Test Scenario 1: Basic Group Creation & Navigation

### **Priority:** P0 (Critical)

### **Objective:** Verify users can create groups and navigate between views without errors.

### **Steps:**

1. **Login to the application**
   - Navigate to `/login`
   - Enter valid credentials
   - ✅ **Expected:** Successfully logged in, redirected to dashboard

2. **Navigate to Groups Page**
   - Click on "Groups" in sidebar/navigation
   - ✅ **Expected:** 
     - URL changes to `/app/groups`
     - Page loads without errors
     - Shows "Create Group" button if no groups exist
     - Shows existing groups if any

3. **Create a New Group**
   - Click "Create Group" or "+" button
   - Fill in group details:
     - **Name:** "Weekend Trip to Goa"
     - **Type:** "Trip"
     - **Members:** Add 3 members (yourself + 2 others)
       - Member 1: You (auto-added)
       - Member 2: "Rahul Sharma" (rahul@example.com)
       - Member 3: "Priya Patel" (priya@example.com)
   - Click "Create"
   - ✅ **Expected:**
     - Success toast notification appears
     - Dialog closes
     - New group appears in the groups list
     - Group card shows:
       - Group name: "Weekend Trip to Goa"
       - Type badge: "TRIP"
       - Member count: 3
       - Balance: ₹0 (initially)

4. **Navigate to Group Details**
   - Click on the newly created group card
   - ✅ **Expected:**
     - **CRITICAL:** Should show loader ("Loading Group Details...")
     - **CRITICAL:** Should NOT show empty/zero balances before data loads
     - URL changes to `/app/groups/{groupId}`
     - Group details page loads completely with:
       - Group name in header
       - All 3 members visible
       - Empty expenses list (no expenses yet)
       - All balances showing ₹0.00
       - "Add Expense" button visible

5. **Navigate Back to Groups List**
   - Click back arrow/button
   - ✅ **Expected:**
     - Returns to `/app/groups`
     - Group list still shows the created group
     - No data loss

### **Pass Criteria:**
- [ ] All navigation works smoothly
- [ ] No console errors
- [ ] No flickering or partial data display
- [ ] Loader shows properly during transitions

---

## 🎯 Test Scenario 2: Simple Equal Split Calculation

### **Priority:** P0 (Critical - Core Math)

### **Objective:** Verify equal split calculations are accurate.

### **Setup:** Use the "Weekend Trip to Goa" group with 3 members (You, Rahul, Priya)

### **Steps:**

1. **Add First Expense - Hotel Booking**
   - Click "Add Expense" button
   - Fill in expense details:
     - **Description:** "Hotel Booking - 2 Nights"
     - **Amount:** ₹6,000
     - **Category:** "Accommodation"
     - **Paid By:** You
     - **Split Type:** "Equal"
     - **Split Among:** All 3 members (You, Rahul, Priya)
   - Click "Add Expense"
   
   - ✅ **Expected Calculation:**
     ```
     Total: ₹6,000
     Per Person: ₹6,000 ÷ 3 = ₹2,000
     
     You paid: ₹6,000
     You owe: ₹2,000
     Net for You: ₹6,000 - ₹2,000 = +₹4,000 (You are owed)
     
     Rahul paid: ₹0
     Rahul owes: ₹2,000
     Net for Rahul: -₹2,000 (Rahul owes)
     
     Priya paid: ₹0
     Priya owes: ₹2,000
     Net for Priya: -₹2,000 (Priya owes)
     ```
   
   - ✅ **Expected UI:**
     - Success toast appears
     - Expense appears in the list
     - **Your Balance:** Shows "+₹4,000" in green with "RECEIVE" label
     - **Rahul's Balance:** Shows "-₹2,000" (owes you)
     - **Priya's Balance:** Shows "-₹2,000" (owes you)
     - **Settlement Suggestions:** Should show:
       - "Rahul pays You ₹2,000"
       - "Priya pays You ₹2,000"

2. **Add Second Expense - Dinner**
   - Click "Add Expense"
   - Fill in:
     - **Description:** "Dinner at Beach Shack"
     - **Amount:** ₹1,500
     - **Category:** "Food"
     - **Paid By:** Rahul
     - **Split Type:** "Equal"
     - **Split Among:** All 3 members
   - Click "Add Expense"
   
   - ✅ **Expected Calculation:**
     ```
     Dinner Split:
     Per Person: ₹1,500 ÷ 3 = ₹500
     
     Rahul paid: ₹1,500
     Rahul owes from dinner: ₹500
     Net from dinner: ₹1,500 - ₹500 = +₹1,000
     
     CUMULATIVE BALANCES:
     You: 
       - Owed from Hotel: +₹4,000
       - Owe from Dinner: -₹500
       - Net: +₹3,500 (You are owed)
     
     Rahul:
       - Owes from Hotel: -₹2,000
       - Owed from Dinner: +₹1,000
       - Net: -₹1,000 (Rahul owes)
     
     Priya:
       - Owes from Hotel: -₹2,000
       - Owes from Dinner: -₹500
       - Net: -₹2,500 (Priya owes)
     ```
   
   - ✅ **Expected UI:**
     - **Your Balance:** "+₹3,500" (green, RECEIVE)
     - **Rahul's Balance:** "-₹1,000" (red, owes)
     - **Priya's Balance:** "-₹2,500" (red, owes)
     - **Total Group Spending:** ₹7,500
     - **Settlement Suggestions:** Should optimize to:
       - "Rahul pays You ₹1,000"
       - "Priya pays You ₹2,500"

3. **Verify Group List Balance**
   - Navigate back to Groups list
   - ✅ **Expected:**
     - "Weekend Trip to Goa" card shows "+₹3,500" with green indicator
     - Member count: 3
     - No errors

### **Pass Criteria:**
- [ ] All calculations match expected values exactly
- [ ] Balances update in real-time
- [ ] Settlement suggestions are mathematically correct
- [ ] No rounding errors (all amounts in whole rupees)

---

## 🎯 Test Scenario 3: Unequal/Custom Split Calculation

### **Priority:** P1 (High - Core Feature)

### **Objective:** Verify custom split amounts work correctly.

### **Setup:** Create a new group "Office Lunch" with 4 members (You, Alice, Bob, Charlie)

### **Steps:**

1. **Create Group**
   - Name: "Office Lunch"
   - Type: "Other"
   - Members: 4 (You, Alice, Bob, Charlie)

2. **Add Unequal Split Expense**
   - Click "Add Expense"
   - Fill in:
     - **Description:** "Pizza Party - Different Sizes"
     - **Amount:** ₹2,000
     - **Category:** "Food"
     - **Paid By:** You
     - **Split Type:** "Unequal"
     - **Custom Splits:**
       - You: ₹800 (ate more)
       - Alice: ₹400
       - Bob: ₹400
       - Charlie: ₹400
   - Click "Add Expense"
   
   - ✅ **Expected Calculation:**
     ```
     Total: ₹2,000
     Sum of splits: ₹800 + ₹400 + ₹400 + ₹400 = ₹2,000 ✓
     
     You paid: ₹2,000
     You owe: ₹800
     Net: ₹2,000 - ₹800 = +₹1,200 (You are owed)
     
     Alice owes: ₹400
     Bob owes: ₹400
     Charlie owes: ₹400
     ```
   
   - ✅ **Expected UI:**
     - **Your Balance:** "+₹1,200"
     - **Alice Balance:** "-₹400"
     - **Bob Balance:** "-₹400"
     - **Charlie Balance:** "-₹400"

3. **Test Split Validation**
   - Try to add expense with splits NOT totaling the amount
   - Fill in:
     - Amount: ₹1,000
     - Splits: You: ₹300, Alice: ₹300, Bob: ₹300 (Total: ₹900)
   - ✅ **Expected:**
     - Error message: "Split amounts must equal total amount"
     - Cannot submit the expense
     - Form shows validation error

### **Pass Criteria:**
- [ ] Custom splits calculate correctly
- [ ] Validation prevents incorrect split totals
- [ ] All balances update accurately

---

## 🎯 Test Scenario 4: Percentage-Based Split

### **Priority:** P1 (High)

### **Objective:** Verify percentage splits work and handle rounding correctly.

### **Setup:** Use "Office Lunch" group (4 members)

### **Steps:**

1. **Add Percentage Split Expense**
   - Click "Add Expense"
   - Fill in:
     - **Description:** "Team Dinner - Manager Pays More"
     - **Amount:** ₹5,000
     - **Category:** "Food"
     - **Paid By:** You
     - **Split Type:** "Percentage"
     - **Percentages:**
       - You: 40% (₹2,000)
       - Alice: 20% (₹1,000)
       - Bob: 20% (₹1,000)
       - Charlie: 20% (₹1,000)
   - Click "Add Expense"
   
   - ✅ **Expected Calculation:**
     ```
     Total: ₹5,000
     
     You: 40% of ₹5,000 = ₹2,000
     Alice: 20% of ₹5,000 = ₹1,000
     Bob: 20% of ₹5,000 = ₹1,000
     Charlie: 20% of ₹5,000 = ₹1,000
     
     You paid: ₹5,000
     You owe: ₹2,000
     Net: +₹3,000 (You are owed)
     
     CUMULATIVE (with Pizza):
     You: +₹1,200 + ₹3,000 = +₹4,200
     Alice: -₹400 - ₹1,000 = -₹1,400
     Bob: -₹400 - ₹1,000 = -₹1,400
     Charlie: -₹400 - ₹1,000 = -₹1,400
     ```

2. **Test Percentage Validation**
   - Try percentages not totaling 100%
   - Fill in: You: 50%, Alice: 30%, Bob: 10% (Total: 90%)
   - ✅ **Expected:**
     - Error: "Percentages must total 100%"
     - Cannot submit

### **Pass Criteria:**
- [ ] Percentage calculations are accurate
- [ ] Validation works for percentage totals
- [ ] Cumulative balances are correct

---

## 🎯 Test Scenario 5: Settlement/Payment Recording

### **Priority:** P0 (Critical - Money Movement)

### **Objective:** Verify settlements reduce balances correctly.

### **Setup:** Use "Weekend Trip to Goa" group (Current state: You are owed ₹3,500)

### **Steps:**

1. **Record Partial Settlement from Rahul**
   - In Group Details, find settlement suggestion "Rahul pays You ₹1,000"
   - Click "Settle" or settlement button
   - Confirm the settlement
   
   - ✅ **Expected Calculation:**
     ```
     Before Settlement:
     You: +₹3,500
     Rahul: -₹1,000
     Priya: -₹2,500
     
     Settlement: Rahul pays You ₹1,000
     
     After Settlement:
     You: +₹3,500 - ₹1,000 = +₹2,500
     Rahul: -₹1,000 + ₹1,000 = ₹0 (settled)
     Priya: -₹2,500 (unchanged)
     ```
   
   - ✅ **Expected UI:**
     - Settlement recorded as an expense/transaction
     - **Your Balance:** "+₹2,500"
     - **Rahul's Balance:** "₹0.00" (neutral/settled)
     - **Priya's Balance:** "-₹2,500"
     - Settlement appears in transaction history

2. **Record Full Settlement from Priya**
   - Click settle for "Priya pays You ₹2,500"
   - Confirm
   
   - ✅ **Expected:**
     ```
     After Settlement:
     You: +₹2,500 - ₹2,500 = ₹0
     Rahul: ₹0
     Priya: -₹2,500 + ₹2,500 = ₹0
     
     All balances: ₹0 (fully settled)
     ```
   
   - ✅ **Expected UI:**
     - All member balances show "₹0.00"
     - Group card in list shows "₹0" or "SETTLED"
     - No settlement suggestions shown

### **Pass Criteria:**
- [ ] Settlements reduce balances correctly
- [ ] Settlement transactions are recorded
- [ ] UI updates immediately
- [ ] Zero balances display correctly

---

## 🎯 Test Scenario 6: Complex Multi-Expense Scenario

### **Priority:** P1 (High - Real World Usage)

### **Objective:** Test complex scenario with multiple expenses, different payers, and mixed split types.

### **Setup:** Create "Bangalore Trip" group with 5 members (You, Dev, Sarah, Mike, Lisa)

### **Steps:**

1. **Expense 1: Flight Tickets (You paid)**
   - Amount: ₹25,000
   - Split: Equal among all 5
   - Per person: ₹5,000
   - Your net: +₹20,000

2. **Expense 2: Hotel (Dev paid)**
   - Amount: ₹15,000
   - Split: Equal among all 5
   - Per person: ₹3,000
   - Dev's net: +₹12,000
   - Your cumulative: +₹20,000 - ₹3,000 = +₹17,000

3. **Expense 3: Dinner (Sarah paid)**
   - Amount: ₹4,000
   - Split: Unequal
     - You: ₹1,000
     - Dev: ₹1,000
     - Sarah: ₹800
     - Mike: ₹600
     - Lisa: ₹600
   - Sarah's net: +₹3,200
   - Your cumulative: +₹17,000 - ₹1,000 = +₹16,000

4. **Expense 4: Cab (Mike paid)**
   - Amount: ₹2,500
   - Split: Equal among all 5
   - Per person: ₹500
   - Mike's net: +₹2,000
   - Your cumulative: +₹16,000 - ₹500 = +₹15,500

5. **Final Expected Balances:**
   ```
   You: +₹15,500 (owed)
   Dev: +₹12,000 - ₹3,000 - ₹1,000 - ₹500 = +₹7,500 (owed)
   Sarah: +₹3,200 - ₹5,000 - ₹500 = -₹2,300 (owes)
   Mike: +₹2,000 - ₹5,000 - ₹3,000 - ₹600 = -₹6,600 (owes)
   Lisa: -₹5,000 - ₹3,000 - ₹600 - ₹500 = -₹9,100 (owes)
   
   Verification: +₹15,500 + ₹7,500 - ₹2,300 - ₹6,600 - ₹9,100 = ₹5,000
   Wait, this should equal ₹0!
   
   Let me recalculate:
   Total Spent: ₹25,000 + ₹15,000 + ₹4,000 + ₹2,500 = ₹46,500
   
   You paid: ₹25,000, owe: ₹9,300, net: +₹15,700
   Dev paid: ₹15,000, owe: ₹7,500, net: +₹7,500
   Sarah paid: ₹4,000, owe: ₹10,300, net: -₹6,300
   Mike paid: ₹2,500, owe: ₹9,100, net: -₹6,600
   Lisa paid: ₹0, owe: ₹10,300, net: -₹10,300
   
   Check: +₹15,700 + ₹7,500 - ₹6,300 - ₹6,600 - ₹10,300 = ₹0 ✓
   ```

### **Pass Criteria:**
- [ ] All individual expense calculations are correct
- [ ] Cumulative balances update properly
- [ ] Final balances sum to zero
- [ ] Settlement suggestions are optimal

---

## 🎯 Test Scenario 7: Expense Editing & Deletion

### **Priority:** P1 (High - Data Integrity)

### **Objective:** Verify editing and deleting expenses recalculates balances correctly.

### **Steps:**

1. **Edit an Existing Expense**
   - In "Weekend Trip to Goa", edit the "Hotel Booking" expense
   - Change amount from ₹6,000 to ₹7,200
   - Keep split type as Equal
   - Save changes
   
   - ✅ **Expected:**
     - New per person: ₹7,200 ÷ 3 = ₹2,400
     - All balances recalculate based on new amount
     - Expense list shows updated amount
     - Edit timestamp updated

2. **Delete an Expense**
   - Delete the "Dinner at Beach Shack" expense (₹1,500)
   - Confirm deletion
   
   - ✅ **Expected:**
     - Expense removed from list
     - Balances recalculate without this expense
     - Cannot undo (or undo works if implemented)
     - Success toast shown

3. **Verify Balance Integrity**
   - After edits, verify all balances still sum to zero
   - Check settlement suggestions are still valid

### **Pass Criteria:**
- [ ] Edits recalculate all balances
- [ ] Deletions update balances correctly
- [ ] No orphaned data
- [ ] Balance integrity maintained (sum = 0)

---

## 🎯 Test Scenario 8: Member Management

### **Priority:** P1 (High)

### **Objective:** Test adding/removing members and impact on existing expenses.

### **Steps:**

1. **Add New Member to Existing Group**
   - In "Office Lunch" group, click "Add Member"
   - Add "Emma" (emma@example.com)
   - ✅ **Expected:**
     - Emma appears in member list
     - Emma's balance: ₹0 (not part of previous expenses)
     - Existing balances unchanged
     - Emma can be added to new expenses

2. **Add Expense with New Member**
   - Add "Coffee Break" expense
   - Amount: ₹500
   - Split equally among all 5 members (including Emma)
   - ✅ **Expected:**
     - Per person: ₹100
     - Emma's balance: -₹100
     - Other balances adjust accordingly

3. **Test Member Removal Restrictions**
   - Try to remove a member who has non-zero balance
   - ✅ **Expected:**
     - Error/warning: "Cannot remove member with outstanding balance"
     - Member not removed
   
   - Try to remove a member with zero balance
   - ✅ **Expected:**
     - Member removed successfully
     - No impact on other balances

### **Pass Criteria:**
- [ ] New members can be added
- [ ] New members start with ₹0 balance
- [ ] Cannot remove members with balances
- [ ] Can remove settled members

---

## 🎯 Test Scenario 9: Group Deletion & Data Cleanup

### **Priority:** P0 (Critical - Data Safety)

### **Objective:** Verify group deletion works and data is properly cleaned up.

### **Steps:**

1. **Attempt to Delete Group with Balances**
   - Try to delete "Weekend Trip to Goa" (has non-zero balances)
   - ✅ **Expected:**
     - Warning: "Group has unsettled balances"
     - Confirmation dialog with balance summary
     - Option to proceed or cancel

2. **Delete Fully Settled Group**
   - Create a test group, add expenses, settle all
   - Delete the group
   - ✅ **Expected:**
     - Confirmation dialog
     - Group deleted successfully
     - Removed from groups list
     - Cannot access via URL
     - Data cleaned from database

3. **Verify Cascade Deletion**
   - After deleting group, verify:
     - All expenses deleted
     - All settlements deleted
     - Member associations removed
     - No orphaned data in database

### **Pass Criteria:**
- [ ] Deletion requires confirmation
- [ ] Warns about unsettled balances
- [ ] Fully removes all related data
- [ ] No broken references remain

---

## 🎯 Test Scenario 10: UI/UX & Edge Cases

### **Priority:** P2 (Medium - User Experience)

### **Objective:** Test UI behavior, responsiveness, and edge cases.

### **Steps:**

1. **Test Empty States**
   - [ ] New user with no groups sees "Create your first group" message
   - [ ] Group with no expenses shows "No expenses yet" message
   - [ ] All settled group shows appropriate messaging

2. **Test Loading States**
   - [ ] Groups list shows loader while fetching
   - [ ] Group details shows loader during navigation
   - [ ] No flickering or partial data display
   - [ ] Loader appears during expense add/edit

3. **Test Responsive Design**
   - [ ] Test on mobile viewport (375px)
   - [ ] Test on tablet viewport (768px)
   - [ ] Test on desktop (1920px)
   - [ ] All cards, buttons, and text are readable
   - [ ] No horizontal scrolling
   - [ ] Touch targets are adequate (min 44px)

4. **Test Long Content**
   - [ ] Group name with 100+ characters
   - [ ] Expense description with 200+ characters
   - [ ] Member name with special characters
   - [ ] Very large amounts (₹10,00,00,000)
   - [ ] Verify text truncation with ellipsis

5. **Test Decimal/Rounding**
   - Add expense: ₹100 split among 3 people
   - Expected: ₹33.33, ₹33.33, ₹33.34 (or similar rounding)
   - [ ] Verify rounding is consistent
   - [ ] Verify total still equals original amount

6. **Test Concurrent Users**
   - [ ] Two users in same group
   - [ ] User A adds expense
   - [ ] User B's view updates (may need refresh)
   - [ ] No data conflicts

7. **Test Network Errors**
   - [ ] Disconnect network during expense add
   - [ ] Verify error message shown
   - [ ] Verify data not corrupted
   - [ ] Can retry after reconnection

8. **Test Browser Compatibility**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)
   - [ ] Mobile Safari (iOS)
   - [ ] Chrome Mobile (Android)

### **Pass Criteria:**
- [ ] All empty states display correctly
- [ ] Loading states prevent user confusion
- [ ] Responsive on all screen sizes
- [ ] Handles edge cases gracefully
- [ ] No crashes or data loss

---

## 🎯 Test Scenario 11: Reports & Export

### **Priority:** P2 (Medium)

### **Objective:** Verify report generation and data export functionality.

### **Steps:**

1. **Generate PDF Report**
   - In group details, click "Report" icon
   - ✅ **Expected:**
     - PDF preview opens
     - Contains group name, members, all expenses
     - Shows balances and settlement suggestions
     - Properly formatted and readable

2. **Download CSV Export**
   - Click export/download CSV option
   - ✅ **Expected:**
     - CSV file downloads
     - Contains all expense data
     - Proper column headers
     - Can open in Excel/Google Sheets

3. **Share Report**
   - Click share button (if available)
   - ✅ **Expected:**
     - Share dialog opens (if supported)
     - Can share via available channels
     - Fallback to download if share not supported

### **Pass Criteria:**
- [ ] PDF generates without errors
- [ ] CSV export is accurate
- [ ] Share functionality works or falls back gracefully

---

## 🎯 Test Scenario 12: Performance & Optimization

### **Priority:** P2 (Medium)

### **Objective:** Verify app performs well under load.

### **Steps:**

1. **Test with Many Groups**
   - Create 20+ groups
   - ✅ **Expected:**
     - Groups list loads in < 2 seconds
     - Scrolling is smooth
     - No memory leaks

2. **Test with Many Expenses**
   - Add 50+ expenses to a single group
   - ✅ **Expected:**
     - Expense list renders in < 2 seconds
     - Calculations are accurate
     - Pagination or virtual scrolling works (if implemented)

3. **Test with Many Members**
   - Create group with 20+ members
   - ✅ **Expected:**
     - Member list displays correctly
     - Split calculations still work
     - UI remains usable

### **Pass Criteria:**
- [ ] No performance degradation with large datasets
- [ ] Calculations remain accurate
- [ ] UI stays responsive

---

## 📊 Final Verification Checklist

### **Before Launch - Must Verify:**

#### **Data Integrity**
- [ ] All split calculations are mathematically correct
- [ ] Balances always sum to zero across all members
- [ ] Settlements reduce balances correctly
- [ ] Edits and deletions recalculate properly
- [ ] No data loss during operations

#### **User Experience**
- [ ] No flickering or partial data display
- [ ] Loaders show during all async operations
- [ ] Error messages are clear and helpful
- [ ] Success feedback is immediate
- [ ] Navigation is smooth and intuitive

#### **Security & Validation**
- [ ] Users can only access their own groups
- [ ] Input validation prevents invalid data
- [ ] Cannot create negative amounts
- [ ] Cannot create splits that don't total correctly
- [ ] Member removal is restricted appropriately

#### **Cross-Browser & Device**
- [ ] Works on all major browsers
- [ ] Responsive on mobile devices
- [ ] Touch interactions work properly
- [ ] No layout breaking on different screen sizes

#### **Error Handling**
- [ ] Network errors are handled gracefully
- [ ] Server errors show user-friendly messages
- [ ] No crashes or white screens
- [ ] Can recover from errors

---

## 🐛 Bug Reporting Template

When you find an issue, document it as follows:

```markdown
### Bug #[NUMBER]

**Priority:** P0 / P1 / P2
**Status:** Open / In Progress / Fixed

**Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Environment:**
- Browser: 
- Device: 
- OS: 

**Additional Notes:**
[Any other relevant information]
```

---

## ✅ Sign-Off

**Tester Name:** _____________  
**Date:** _____________  
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Pass with Minor Issues

**Critical Issues Found:** _____  
**High Priority Issues Found:** _____  
**Medium Priority Issues Found:** _____

**Ready for Launch:** ⬜ Yes / ⬜ No

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 📞 Support Contacts

**Developer:** Prince Kumar Gupta  
**Launch Date:** January 23, 2026  
**Version:** 1.0.0

---

**Good luck with your launch! 🚀**
