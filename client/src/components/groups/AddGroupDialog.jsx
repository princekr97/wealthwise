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
    Chip,
    styled
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useGroupStore } from '../../store/groupStore';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        maxWidth: '690px',
        width: '100%'
    }
}));

export default function AddGroupDialog({ open, onClose, onGroupCreated, group }) {
    const isEditMode = !!group;
    const { createGroup, updateGroup } = useGroupStore();

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            name: '',
            type: 'Trip',
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
            if (isEditMode && group) {
                reset({
                    name: group.name || '',
                    type: group.type || 'Trip',
                    members: []
                });
            } else {
                reset({
                    name: '',
                    type: 'Trip',
                    members: [{ name: '', email: '', phone: '' }]
                });
            }
        }
    }, [open, isEditMode, group, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateGroup(group._id, {
                    name: data.name,
                    type: data.type
                });
                toast.success('Group updated successfully');
            } else {
                const validMembers = data.members.filter(m => m.name.trim() !== '' && (m.phone?.trim() !== '' || m.email?.trim() !== ''));
                await createGroup({
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
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disableScrollLock={false}
            scroll="body"
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)'
                }
            }}
        >
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#F1F5F9' }}>
                        {isEditMode ? 'Edit Group' : 'Create New Group'}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: '#94A3B8',
                            '&:hover': {
                                color: '#F1F5F9',
                                background: 'rgba(255,255,255,0.08)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Stack spacing={3}>
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: '#F1F5F9',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#14b8a6'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#F1F5F9',
                                        '&::placeholder': {
                                            color: '#64748B',
                                            opacity: 1
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#94A3B8'
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#14b8a6'
                                    }
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#CBD5E1' }}>
                                    Group Category
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                                    {[
                                        { type: 'Home', icon: '🏠' },
                                        { type: 'Trip', icon: '✈️' },
                                        { type: 'Personal', icon: '👤' },
                                        { type: 'Other', icon: '📄' }
                                    ].map((item) => (
                                        <Box
                                            key={item.type}
                                            onClick={() => field.onChange(item.type)}
                                            sx={{
                                                minWidth: 90,
                                                height: 90,
                                                borderRadius: '16px',
                                                border: '2px solid',
                                                borderColor: field.value === item.type ? '#14b8a6' : 'rgba(255, 255, 255, 0.1)',
                                                background: field.value === item.type
                                                    ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 100%)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: field.value === item.type ? '0 4px 16px rgba(20, 184, 166, 0.3)' : 'none',
                                                '&:hover': {
                                                    background: field.value === item.type
                                                        ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.1) 100%)'
                                                        : 'rgba(255, 255, 255, 0.06)',
                                                    transform: 'translateY(-2px)',
                                                    borderColor: field.value === item.type ? '#14b8a6' : 'rgba(255, 255, 255, 0.15)'
                                                }
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{item.icon}</Typography>
                                            <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                sx={{
                                                    color: field.value === item.type ? '#5EEAD4' : '#94A3B8',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {item.type}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    />
                </Stack>

                {/* Actions */}
                <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.2)' }}>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        fullWidth
                        sx={{
                            py: 1.2,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(20, 184, 166, 0.45)'
                            }
                        }}
                    >
                        {isEditMode ? 'Update Group' : 'Create Group'}
                    </Button>
                </Box>
            </Box>
        </StyledDialog>
    );
}
