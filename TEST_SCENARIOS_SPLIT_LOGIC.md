# 🧮 Group Expense & Split Logic - End-to-End Test Plan

This document provides a comprehensive suite of test scenarios to validate the **financial integrity**, **mathematical accuracy**, and **user experience** of the WealthWise group features. This is the single source of truth for the final 2026 launch.

---

## 👥 Section 1: Member Management
**Goal:** Ensure members are added securely and removals don't leave "phantom" debts.

### 1.1: Add Member Validation
- **Action:** Try adding a member with a phone number that is already in the group.
- **Action:** Try adding yourself (as the creator) to the member list again.
- **Action:** Try adding a phone number already in your "Pending/Staging" list.
- **Expected Result:**
  - [ ] Specific toast error: "Member is already in this group".
  - [ ] Specific toast error: "You are already the creator/member of this group".
  - [ ] Specific toast error: "Number is already in your staging list".
  - [ ] Button remains disabled if fields are empty.

### 1.2: The "Debt Lock" Member Removal
- **Scenario:** Removing a member who still owes money.
- **Action:** Create a debt where User B owes User A ₹500. Try to remove User B.
- **Expected Result:** System must **BLOCK** the deletion with a clear warning: *"Cannot remove member with unsettled balance (₹500.00)"*.
- **Edge Case:** Settle the debt (₹0 balance) and then try removing. It should succeed.

### 1.3: Identical Name Collision
- **Scenario:** Two different people with the same name (e.g., "Prince Gupta").
- **Action:** Add two members with the same name but different phone numbers.
- **Expected Result:**
  - [ ] Avatars must have different seeds/colors.
  - [ ] Splits must track the correct unique ID, not the name string.
  - [ ] Delete/Edit must affect only the correct person.

---

## 💸 Section 2: Expense Manipulation & Integrity
**Goal:** Ensure adding, editing, and deleting expenses preserves historical accuracy.

### 2.1: The "Odd Number" Equal Split (Rounding)
- **Input:** ₹100.00 split equally among A, B, and C (3 people).
- **Expected Result:**
  - [ ] Person 1: ₹33.34 (Remainder Collector)
  - [ ] Person 2: ₹33.33
  - [ ] Person 3: ₹33.33
  - [ ] **Total Sum:** Exactly ₹100.00. No "0.01" floating point errors.

### 2.2: Expense Deletion Reversal
- **Action:** User A pays ₹600 for User B. User B's balance becomes -₹600. Delete the expense.
- **Expected Result:** User B's balance returns to ₹0 instantly.
- **Edge Case:** If User B had already partially settled ₹200 before the deletion, deleting the original expense should make User A owe User B ₹200 (overpayment reversal).

### 2.3: Editing Expense Amount/Payer
- **Action:** Change an expense of ₹1000 (split 50/50) to ₹800.
- **Expected Result:** All members' "Owed" amounts must re-calculate automatically.
- **Action:** Change the "Payer" from User A to User B in an existing expense.
- **Expected Result:** User A's "You are owed" must flip to "You owe" (if applicable) and balances must update for the entire group.

---

## 🧪 Section 3: Complex Split Scenarios

### 3.1: The "Payer Excluded" Split (Treats)
- **Scenario:** User A buys a gift for User B and User C but doesn't take one for themselves.
- **Action:** Add ₹500 expense. Payer: User A. Uncheck User A from the "Split Among" list.
- **Expected Result:** User A balance: +₹500. User B: -₹250. User C: -₹250.

### 3.2: Unequal / Custom Split
- **Action:** Add ₹1000 expense. Manually enter: User A (₹100), User B (₹250), User C (₹650).
- **Validation:** Try to save with a total that equals ₹999 or ₹1001.
- **Expected Result:** System blocks save with error: *"Total split (₹999) must equal expense amount (₹1000)"*.

---

## 📉 Section 4: Debt Simplification & Aggregation
**Goal:** Verify the "Netting" logic (You don't owe me if I owe you more).

### 4.1: The "Munnar Trip" Settlement Simplification
- **Scenario (Aggregation):**
  1. Expense 1: Prince pays ₹100 for Prerna.
  2. Expense 2: Prerna pays ₹40 for Prince.
- **Expected Display:** The system should NOT show two debts. It must simplify to: **"Prince is owed ₹60 by Prerna"**.

### 4.2: Automated Settlement Suggestions
- **Scenario:** A owes B ₹100. B owes C ₹100.
- **Expected Result:** The "Suggested Settlements" algorithm should suggest: **"A pays C ₹100"**. (B is bypassed to reduce transactions).

---

## 🏁 Section 5: Settlements (The Final Step)

### 5.1: Single Settlement
- **Action:** User A clicks "Settle" on a ₹500 suggestion from User B.
- **Expected Result:** A "Settlement" Type transaction is created. Balances for both users hit ₹0.

### 5.2: Bulk "Settle All"
- **Action:** User A owes B, C, and D. Clicks "Settle All" in the group summary.
- **Expected Result:**
  - [ ] One confirmation dialog showing multiple recipients.
  - [ ] Successful bulk update (verify via Network tab: single API call).
  - [ ] All debts cleared in one go.

---

## 📊 Section 6: Dashboard & Analytics
**Goal:** Verify "You Paid" vs "You Owe" vs "You are Owed".

### 6.1: Cash Flow Math
- **Setup:** Total Group Spend: ₹1200. You are 1 of 4 members (Your share = ₹300).
- **Action:** You pay for an expense of ₹1200.
- **Verification:**
  - **You Paid (Total):** ₹1200
  - **Your Share:** ₹300
  - **You are Owed:** ₹900 (You paid 1200, but 300 was your own share).

### 6.2: Settlement Impact on Display
- **Setup:** You owe ₹500.
- **Action:** You pay a settlement of ₹500.
- **Verification:**
  - **You Paid (Settlements):** ₹500
  - **Net Balance:** ₹0
  - **"You Owe" Label:** Should disappear or show "All Settled Up".

---

## 📱 Section 7: Edge Cases & UI Performance

### 7.1: Timezone & Time Precision
- **Action:** Add an expense and check the "Time" in the detail dialog.
- **Verification:** It should show the **Actual Time** (e.g., 12:54 PM) using the `createdAt` timestamp, NOT the midnight UTC offset (05:30 AM).

### 7.2: Mobile Responsiveness
- **Test:** Open "Add Expense" on a Small Mobile Screen (iPhone SE height).
- **Verification:**
  - [ ] The "Tabs" (Add/Members) are fixed height (500px) and don't jump.
  - [ ] DialogContent has `overflow: hidden` but internal lists scroll smoothly.

### 7.3: Data Safety (Zero/Negative)
- **Test:** Try to enter an amount of `0`, `-50`, or `abc`.
- **Expected Result:** Form validation prevents submission.

### 7.4: Emoji & Large Text
- **Test:** Add a description with 50+ emojis and 500 characters.
- **Verification:** Text should wrap gracefully without breaking the layout.

---

## 🔥 Section 8: Maximum Scale & High-Level Edge Cases

### 8.1: The "New Member" Historical Gap
- **Action:** Create 5 expenses in a group. Then add a New Member.
- **Verification:** The new member should have **₹0 balance**. They should NOT inherit or be bothered by historical debts they weren't part of.

### 8.2: Maximum Member Stress Test
- **Action:** Add 50 members to a group. Add an expense of ₹5000 split equally.
- **Verification:**
  - [ ] Group Details stays responsive (no lag in list).
  - [ ] Splitting logic handles 50 entries instantly.
  - [ ] "Suggested Settlements" calculates correctly without timing out.

### 8.3: Simultaneous Conflict (Race Condition)
- **Action:** Two users open the "Add Member" dialog at the same time and add two different people.
- **Action:** Two users add an expense at the same time.
- **Verification:** Backend must handle concurrent saves safely without overwriting previous data.

### 8.4: Deleting the Group Creator
- **Action:** Creator (User A) tries to leave the group while others have debts.
- **Expected Result:** System blocks this. A creator must either delete the group or transfer ownership (if supported) after all debts are zeroed.

### 8.5: Network Failure during Bulk Settle
- **Action:** Trigger "Settle All", then immediately go Offline (Airplane Mode).
- **Verification:** UI should show a graceful "Network Error" toast and NOT mark the locally cached balances as settled until the server confirms.

---
**WealthWise Launch Commitment:** All "Pass Criteria" must be met for a Green Release.
