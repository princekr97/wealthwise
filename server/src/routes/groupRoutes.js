import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMember
} from '../controllers/groupController.js';
import {
    addExpense,
    settleDebt,
    bulkSettleDebts,
    updateExpense,
    deleteExpense
} from '../controllers/groupExpenseController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createGroup)
    .get(getGroups);

router.route('/:id')
    .get(getGroupDetails)
    .put(updateGroup)
    .delete(deleteGroup);

router.route('/:id/members')
    .post(addMemberToGroup);

router.route('/:id/members/:memberId')
    .delete(removeMember);

router.route('/:groupId/expenses')
    .post(addExpense);

router.route('/:groupId/expenses/:expenseId')
    .put(updateExpense)
    .delete(deleteExpense);

router.route('/:groupId/settle')
    .post(settleDebt);

router.route('/:groupId/settle/bulk')
    .post(bulkSettleDebts);

export default router;
