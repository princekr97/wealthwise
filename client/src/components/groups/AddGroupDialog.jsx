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
            name: '',
            type: 'Other',
            members: [{ name: '', email: '' }]
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
                    members: [{ name: '', email: '' }]
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
                const validMembers = data.members.filter(m => m.name.trim() !== '' || m.email.trim() !== '');
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
                            <FormControl fullWidth>
                                <InputLabel>Group Type</InputLabel>
                                <Select {...field} label="Group Type">
                                    {GROUP_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />

                    {!isEditMode && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Add Members
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Add members by name and mobile/email. If they're on WealthWise, they'll be linked automatically.
                            </Typography>

                            <Stack spacing={2}>
                                {fields.map((field, index) => (
                                    <Stack key={field.id} direction="row" spacing={1} alignItems="flex-start">
                                        <Controller
                                            name={`members.${index}.name`}
                                            control={control}
                                            rules={{ required: 'Name is required' }}
                                            render={({ field: inputField, fieldState: { error } }) => (
                                                <TextField
                                                    {...inputField}
                                                    label="Name"
                                                    size="small"
                                                    sx={{ flex: 1 }}
                                                    error={!!error}
                                                    helperText={error?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name={`members.${index}.email`}
                                            control={control}
                                            render={({ field: inputField }) => (
                                                <TextField
                                                    {...inputField}
                                                    label="Mobile/Email (Optional)"
                                                    size="small"
                                                    sx={{ flex: 1.5 }}
                                                    placeholder="9876543210 or email@example.com"
                                                />
                                            )}
                                        />
                                        {index > 0 && (
                                            <IconButton size="small" onClick={() => remove(index)} color="error" sx={{ mt: 0.5 }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    size="small"
                                    onClick={() => append({ name: '', email: '' })}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    Add Member
                                </Button>
                            </Stack>
                        </Box>
                    )}
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
