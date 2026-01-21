import { apiClient as api } from './api';

export const groupService = {
    // Create a new group
    createGroup: async (groupData) => {
        const response = await api.post('/groups', groupData);
        return response.data;
    },

    // Get all user groups
    getGroups: async () => {
        const response = await api.get('/groups');
        return response.data;
    },

    // Get single group details
    getGroupDetails: async (id) => {
        const response = await api.get(`/groups/${id}`);
        return response.data;
    },

    // Update group
    updateGroup: async (id, groupData) => {
        const response = await api.put(`/groups/${id}`, groupData);
        return response.data;
    },

    // Delete a group
    deleteGroup: async (id) => {
        const response = await api.delete(`/groups/${id}`);
        return response.data;
    },

    // Add member to group
    addMemberToGroup: async (groupId, memberData) => {
        const response = await api.post(`/groups/${groupId}/members`, memberData);
        return response.data;
    },

    // Remove member from group
    removeMember: async (groupId, memberId) => {
        const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
        return response.data;
    },

    // Add expense to group
    addExpense: async (groupId, expenseData) => {
        const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
        return response.data;
    },

    // Settle debt
    settleDebt: async (groupId, settlementData) => {
        const response = await api.post(`/groups/${groupId}/settle`, settlementData);
        return response.data;
    },

    // Update expense
    updateExpense: async (groupId, expenseId, expenseData) => {
        const response = await api.put(`/groups/${groupId}/expenses/${expenseId}`, expenseData);
        return response.data;
    },

    // Delete expense
    deleteExpense: async (groupId, expenseId) => {
        const response = await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
        return response.data;
    }
};
