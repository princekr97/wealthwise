import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Avatar,
    Chip
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';

const GROUP_TYPES = ['Trip', 'Home', 'Couple', 'Other'];

export default function AddGroupDialog({ open, onClose, onGroupCreated, group }) {
    const isEditMode = !!group;

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            // 1. Update defaultValues
            name: '',
            type: 'Other',
            members: [{ name: '', email: '', phone: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'members'
    });

    // Reset/Populate form when opening
    React.useEffect(() => {
        if (open) {
            if (isEditMode) {
                reset({
                    name: group.name,
                    type: group.type,
                    members: [] // Not editing members for now
                });
            } else {
                reset({
                    name: '',
                    type: 'Other',
                    members: [{ name: '', email: '', phone: '' }]
                });
            }
        }
    }, [open, isEditMode, group, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await groupService.updateGroup(group._id, {
                    name: data.name,
                    type: data.type
                });
                toast.success('Group updated successfully');
            } else {
                const validMembers = data.members.filter(m => m.name.trim() !== '' && (m.phone?.trim() !== '' || m.email?.trim() !== ''));
                await groupService.createGroup({
                    ...data,
                    members: validMembers
                });
                toast.success('Group created successfully');
            }
            reset();
            onGroupCreated();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} group`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditMode ? 'Edit Group' : 'Create New Group'}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Group name is required' }}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Group Name"
                                fullWidth
                                error={!!error}
                                helperText={error?.message}
                                placeholder="e.g. Goa Trip, Apartment 502"
                            />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Group Category
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, px: 0.5 }}>
                                    {[
                                        { type: 'Home', icon: '🏠', label: 'Home' },
                                        { type: 'Trip', icon: '✈️', label: 'Trip' },
                                        { type: 'Personal', icon: '👤', label: 'Personal' }, // Changed 'Couple' to 'Personal' based on user image, or keep logic. Image implies 'Personal' is an option? Let's stick to standard types mapped to UI. 
                                        { type: 'Other', icon: '📄', label: 'Business' }
                                    ].map((item) => (
                                        <Box
                                            key={item.type}
                                            onClick={() => field.onChange(item.type)}
                                            sx={{
                                                minWidth: 80,
                                                height: 80,
                                                borderRadius: 3,
                                                border: '2px solid',
                                                borderColor: field.value === item.type ? 'primary.main' : 'transparent',
                                                bgcolor: field.value === item.type ? 'primary.lighter' : '#f8fafc',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: field.value === item.type ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                                                '&:hover': {
                                                    bgcolor: field.value === item.type ? 'primary.lighter' : '#f1f5f9',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                                            <Typography variant="caption" fontWeight={600} color={field.value === item.type ? 'primary.main' : 'text.secondary'}>
                                                {item.type}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    />


                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={false}>
                    {isEditMode ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
