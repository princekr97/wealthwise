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
import crypto from 'crypto';

/**
 * Link shadow members to real user account
 * @param {Object} user - The newly registered/logged in user
 * @returns {Promise<Object>} - Stats about linked groups
 */
export const linkShadowMembersToUser = async (user) => {
    try {
        const { _id: userId, email, phoneNumber: phone } = user;

        console.log(`🔗 Attempting to link shadow members for user: ${userId}, phone: ${phone}, email: ${email}`);

        // Find ALL groups where a member has matching phone or email
        // We don't care about userId - we match by phone/email only
        const query = {
            $or: []
        };

        // Match by phone (primary key)
        if (phone) {
            query.$or.push({ 'members.phone': phone });
        }

        // Match by email (secondary key)
        if (email) {
            query.$or.push({ 'members.email': email.toLowerCase() });
        }

        if (query.$or.length === 0) {
            console.log('⚠️  No phone or email to match');
            return {
                success: false,
                linkedGroupsCount: 0,
                groupNames: [],
                message: 'No contact information available for linking'
            };
        }

        const groupsWithMatchingMembers = await Group.find(query);
        console.log(`📊 Found ${groupsWithMatchingMembers.length} groups with matching phone/email`);

        let linkedCount = 0;
        const linkedGroupNames = [];

        // Update each matching member with the real userId
        for (const group of groupsWithMatchingMembers) {
            let groupUpdated = false;

            group.members.forEach(member => {
                // Match by phone (primary) or email (secondary)
                const phoneMatch = phone && member.phone && member.phone === phone;
                const emailMatch = email && member.email && member.email.toLowerCase() === email.toLowerCase();

                // If phone/email matches AND userId is different (shadow or old)
                if ((phoneMatch || emailMatch) && String(member.userId) !== String(userId)) {
                    const oldUserId = member.userId;
                    member.userId = userId;
                    member.isShadowUser = false;
                    groupUpdated = true;
                    console.log(`✅ Linked member "${member.name}" in group "${group.name}"`);
                    console.log(`   Phone: ${member.phone}, Email: ${member.email}`);
                    console.log(`   Old userId: ${oldUserId} → New userId: ${userId}`);
                }
            });

            if (groupUpdated) {
                await group.save();
                linkedCount++;
                linkedGroupNames.push(group.name);
            }
        }

        const message = linkedCount > 0 
            ? `Welcome! You've been automatically added to ${linkedCount} group(s): ${linkedGroupNames.join(', ')}`
            : 'No existing groups found';

        console.log(`🎉 Linking complete: ${linkedCount} groups linked`);

        return {
            success: true,
            linkedGroupsCount: linkedCount,
            groupNames: linkedGroupNames,
            message
        };

    } catch (error) {
        console.error('❌ Shadow user linking error:', error);
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
