import React, { useState, useCallback } from 'react';
import {
    Typography,
    Avatar,
    Card,
    Grid,
    Modal,
    Box,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';

const ConnectionsList = ({ connections, open, onClose, onRemoveConnection }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const [removing, setRemoving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const handleRemoveClick = useCallback((connectionId) => {
        setSelectedConnectionId(connectionId);
        setConfirmOpen(true);
    }, []);

    const handleConfirmRemove = useCallback(async () => {
        setRemoving(true);
        try {
            await onRemoveConnection(selectedConnectionId);
            enqueueSnackbar('Connection removed successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to remove connection.', { variant: 'error' });
        } finally {
            setRemoving(false);
            setConfirmOpen(false);
        }
    }, [onRemoveConnection, selectedConnectionId, enqueueSnackbar]);

    const handleCancelRemove = useCallback(() => {
        setConfirmOpen(false);
    }, []);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    const filteredConnections = connections.filter((connection) =>
        connection.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                sx={{ zIndex: 1300 }} // Ensure modal is on top
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        color: 'black',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper', // Ensure background color is set
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 2,
                        zIndex: 1400, // Ensure content is on top
                    }}
                >
                    <Tooltip title="Close">
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'text.secondary',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Centered "Connections" text */}
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{ mb: 2, textAlign: 'center' }} // Center the text
                    >
                        Connections
                    </Typography>

                    {/* Search Bar */}
                    <TextField
                        fullWidth
                        placeholder="Search connections..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                        }}
                    />

                    {filteredConnections.length === 0 ? (
                        <Typography sx={{ textAlign: 'center' }}>No connections found.</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredConnections.map((connection) => (
                                <Grid item key={connection.id} xs={12}>
                                    <Card
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1,
                                            transition: 'box-shadow 0.3s',
                                            '&:hover': {
                                                boxShadow: 3,
                                            },
                                        }}
                                    >
                                        <Avatar
                                            src={connection.photoURL}
                                            alt={connection.displayName}
                                            sx={{ mr: 2, cursor: 'pointer' }}
                                            onClick={() => console.log('Navigate to profile')} // Add profile navigation
                                        />
                                        <Typography
                                            variant="body1"
                                            sx={{ flexGrow: 1, cursor: 'pointer' }}
                                            onClick={() => console.log('Navigate to profile')} // Add profile navigation
                                        >
                                            {connection.displayName}
                                        </Typography>
                                        <Tooltip title="Remove connection">
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: 'lightgrey',
                                                    color: 'black',
                                                    borderRadius: 2,
                                                    fontSize: '0.875rem', // Smaller text
                                                    padding: '4px 8px', // Adjust padding
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        backgroundColor: 'grey',
                                                    },
                                                }}
                                                size="small"
                                                onClick={() => handleRemoveClick(connection.id)} // Open confirmation dialog
                                            >
                                                Remove
                                            </Button>
                                        </Tooltip>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Modal>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={handleCancelRemove}>
                <DialogTitle>Confirm Removal</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to remove this connection?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRemove}>Cancel</Button>
                    <Button onClick={handleConfirmRemove} color="error" disabled={removing}>
                        {removing ? 'Removing...' : 'Remove'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ConnectionsList;