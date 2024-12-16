import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button } from '@mui/material';
import useRazorpay from 'react-razorpay';
import { useCallback } from 'react';
import { createOrder, getUserDetails } from '../api';
import { RazorpayOptions } from 'react-razorpay';
import { User } from '../interfaces';
import '../css/AddCredits.css';

const maxAmount = 500;
const minAmount = 1;

function AddCredits({
    user,
}: {
    user: User;
}) {
    const [amount, setAmount] = useState<number>(100);
    const [error, setError] = useState<string | null>(null);
    const [Razorpay] = useRazorpay();
    const currentUser = useRef<User>();
    
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
        currentUser.current = user;
    }, [user]);

    const handlePayment = useCallback(
        async (amount: number) => {
            const validationError = validateAmount(amount);
            if (validationError) {
                setError(validationError);
                return;
            }
            setError(null);

            const orderResponse = await createOrder({
                amount: amount,
            });
            const options: RazorpayOptions = {
                key: orderResponse.key_id,
                amount: Number(amount * 100).toFixed(2),
                currency: 'INR',
                name: 'Payment For Adding Credits of ' + amount,
                order_id: orderResponse.order_id,
                handler: function (response) {
                    console.log({
                        response,
                    });
                },
                prefill: {
                    name: user?.firstName,
                    email: user?.email,
                },
            };
            const rzpay = new Razorpay(options);
            rzpay.open();
        },
        [Razorpay, user?.email, user?.firstName]
    );

    if (!user) {
        return null;
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setAmount(value);

        const validationError = validateAmount(value);
        setError(validationError);
    };

    return (
        <div className='add_credits'>
            <div><span>Credits </span><span>{currentUser.current?.credits.toFixed(2)}</span></div>
            <div>
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
                    Add
                </Button>
            </div>
        </div>
    );
}

export default AddCredits;
