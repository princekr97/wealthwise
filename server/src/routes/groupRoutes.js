import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    deleteGroup
} from '../controllers/groupController.js';
import {
    addExpense,
    settleDebt,
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

router.route('/:groupId/expenses')
    .post(addExpense);

router.route('/:groupId/expenses/:expenseId')
    .put(updateExpense)
    .delete(deleteExpense);

router.route('/:groupId/settle')
    .post(settleDebt);

export default router;
