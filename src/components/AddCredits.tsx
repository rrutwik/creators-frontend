import React, { useEffect, useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import useRazorpay from 'react-razorpay';
import { useCallback } from 'react';
import { createRazorPayOrder, getRazorPayOrder } from '../api';
import { RazorpayOptions } from 'react-razorpay';
import '../css/AddCredits.css';
import { useAppContext } from '../AppContext';

const maxAmount = 500;
const minAmount = 1;

function AddCredits() {
    const [amount, setAmount] = useState<number>(100);
    const [error, setError] = useState<string | null>(null);
    const [Razorpay] = useRazorpay();
    const { user, getUserDetails, loadingUser } = useAppContext();

    const validateAmount = (value: number) => {
        if (value < minAmount) {
            return `Amount must be at least ${minAmount}.`;
        }
        if (value > maxAmount) {
            return `Amount cannot exceed ${maxAmount}.`;
        }
        return null;
    };

    useEffect(() => {
    }, [loadingUser]);

    const handlePayment = useCallback(
        async (amount: number) => {
            const validationError = validateAmount(amount);
            if (validationError) {
                setError(validationError);
                return;
            }
            setError(null);

            const orderResponse = await createRazorPayOrder({
                amount: amount,
            });
            const options: RazorpayOptions = {
                key: orderResponse.key_id,
                amount: Number(amount * 100).toFixed(2),
                currency: 'INR',
                name: 'Payment of ' + amount,
                order_id: orderResponse.order_id,
                handler: function (response) {
                    setTimeout(() => {
                        getRazorPayOrder({ order_id: orderResponse.order_id }).then(() => {
                        getUserDetails(); // Fetch updated user details after payment
                    });
                }, 5000)},
                prefill: {
                    name: user?.firstName,
                    email: user?.email,
                },
            };
            const rzpay = new Razorpay(options);
            rzpay.open();
        },
        [Razorpay, getUserDetails, user?.email, user?.firstName]
    );

    if (!user) {
        return <div>Error: User not found</div>;
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setAmount(value);

        const validationError = validateAmount(value);
        setError(validationError);
    };

    return (
        <div className='add_credits'>
            <div><span>Credits </span><span>{user.credits.toFixed(2)}</span></div>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <TextField
                    label='Amount'
                    type='number'
                    InputProps={{ inputProps: { min: minAmount, step: 1, max: maxAmount } }}
                    value={amount}
                    error={!!error}
                    helperText={error}
                    style={{ width: '100%' }}
                    onChange={handleAmountChange}
                />
                <Button 
                    onClick={() => handlePayment(amount)} 
                    disabled={!!error || amount < minAmount || amount > maxAmount}
                >
                    Add Credits
                </Button>
            </Box>
        </div>
    );
}

export default AddCredits;
