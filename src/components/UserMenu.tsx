import { Button, Menu, MenuItem, Modal, Box, TextField } from '@mui/material';
import { useState } from 'react';
import { UserMenuProps } from '../interfaces';

function UserMenu({ username, credits, onAddCredits }: UserMenuProps) {
    // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // const open = Boolean(anchorEl);
    // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     setAnchorEl(event.currentTarget);
    // };
    // const handleClose = () => {
    //     setAnchorEl(null);
    // };
    // // Razorpay integration logic here...
    // return (
    //     <>
    //         <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
    //             {username} (Credits: {credits})
    //         </Button>
    //         <Menu
    //             id="simple-menu"
    //             anchorEl={anchorEl}
    //             keepMounted
    //             open={open}
    //             onClose={handleClose}
    //         >
    //             <MenuItem onClick={handleClose}>Profile</MenuItem>
    //             <MenuItem onClick={handleClose}>Logout</MenuItem>
    //             <MenuItem onClick={() => {/* Open credit add modal */}}>Add Credits</MenuItem>
    //         </Menu>
    //         {/* Modal for adding credits */}
    //         <Modal
    //             open={/* Modal open state */}
    //             onClose={/* Close modal */}
    //         >
    //             <Box>
    //                 <TextField
    //                     label="Add Credits"
    //                     type="number"
    //                     InputProps={{ inputProps: { min: 100, step: 100 } }}
    //                     variant="outlined"
    //                     // onChange to handle input
    //                 />
    //                 <Button onClick={() => onAddCredits(/* Amount from input */)}>Add</Button>
    //             </Box>
    //         </Modal>
    //     </>
    // );
}

export default UserMenu;
