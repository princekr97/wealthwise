/**
 * Shadow User Auto-Linking Service
 * 
 * When a new user registers, this service automatically:
 * 1. Finds all groups where user was added as "shadow member" (by phone/email)
 * 2. Links those shadow members to the real user account  
 * 3. User can immediately see and access those groups
 * 
 * This enables the wealthwise-style collaborative flow:
 * - Friend A creates group, adds Friend B by mobile number
 * - Friend B registers later with that mobile
 * - Friend B automatically sees the group!
 * 
 * Priority: Phone (mandatory) > Email (optional)
 */

import Group from '../models/groupModel.js';

/**
 * Link shadow members to real user account
 * @param {Object} user - The newly registered/logged in user
 * @returns {Promise<Object>} - Stats about linked groups
 */
export const linkShadowMembersToUser = async (user) => {
    try {
        const { _id: userId, email, phone } = user;

        // Find all groups where this user exists as a shadow member
        // (userId is null but email or phone matches)
        const groupsWithShadowUser = await Group.find({
            $or: [
                {
                    'members': {
                        $elemMatch: {
                            email: email ? email.toLowerCase() : null,
                            $or: [
                                { userId: { $exists: false } },
                                { userId: null }
                            ]
                        }
                    }
                },
                {
                    'members': {
                        $elemMatch: {
                            phone: phone || null,
                            $or: [
                                { userId: { $exists: false } },
                                { userId: null }
                            ]
                        }
                    }
                }
            ]
        });

        let linkedCount = 0;
        const linkedGroupNames = [];

        // Update each shadow member with the real userId
        for (const group of groupsWithShadowUser) {
            let groupUpdated = false;

            group.members.forEach(member => {
                // Match by email or phone
                const emailMatch = email && member.email && member.email.toLowerCase() === email.toLowerCase();
                const phoneMatch = phone && member.phone && member.phone === phone;

                // If match found and member is still shadow (no userId)
                if ((emailMatch || phoneMatch) && !member.userId) {
                    member.userId = userId;
                    groupUpdated = true;
                    console.log(`✅ Linked shadow member "${member.name}" to user ${userId} in group "${group.name}"`);
                }
            });

            if (groupUpdated) {
                await group.save();
                linkedCount++;
                linkedGroupNames.push(group.name);
            }
        }

        return {
            success: true,
            linkedGroupsCount: linkedCount,
            groupNames: linkedGroupNames,
            message: linkedCount > 0 
                ? `Welcome! You've been automatically added to ${linkedCount} group(s): ${linkedGroupNames.join(', ')}`
                : 'No existing groups found'
        };

    } catch (error) {
        console.error('Shadow user linking error:', error);
        return {
            success: false,
            linkedGroupsCount: 0,
            groupNames: [],
            error: error.message
        };
    }
};

/**
 * Get all groups for a user (created by them OR they're a member)
 * This replaces the simple "createdBy" query
 * @param {string} userId - User's ObjectId
 * @param {string} userEmail - User's email
 * @param {string} userPhone - User's phone
 * @returns {Promise<Array>} - All accessible groups
 */
export const getUserGroups = async (userId, userEmail, userPhone) => {
    try {
        // Find groups where user is either:
        // 1. Creator (createdBy)
        // 2. Member (members.userId matches)
        // 3. Shadow member now claimed (email/phone match)
        
        const groups = await Group.find({
            $or: [
                // User is creator
                { createdBy: userId },
                
                // User is registered member
                {
                    'members.userId': userId
                },
                
                // User's email matches (for newly linked accounts)
                userEmail ? {
                    'members.email': userEmail.toLowerCase(),
                    'members.userId': userId // Only if already linked
                } : null,
                
                // User's phone matches (for newly linked accounts)
                userPhone ? {
                    'members.phone': userPhone,
                    'members.userId': userId
                } : null
            ].filter(Boolean) // Remove null entries
        }).sort({ createdAt: -1 });

        return groups;

    } catch (error) {
        console.error('Get user groups error:', error);
        throw error;
    }
};
