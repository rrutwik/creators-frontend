import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import useRazorpay from 'react-razorpay';
import { useCallback } from 'react';
import { createOrder } from '../api';
import { RazorpayOptions } from 'react-razorpay';
import { User } from '../interfaces';
import '../css/AddCredits.css';

function AddCredits({
    user,
}: {
    user: User;
}) {
    const [amount, setAmount] = useState<number>(11);
    const [Razorpay] = useRazorpay();
    const handlePayment = useCallback(
        async (amount: number) => {
            const order = await createOrder({
                amount: amount,
            });
            const options: RazorpayOptions = {
                key: order.key_id,
                amount: Number(amount * 100).toFixed(2),
                currency: 'INR',
                name: 'Payment For Adding Credits of ' + amount,
                order_id: order.id,
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
            console.log({
                options,
            });
            const rzpay = new Razorpay(options);
            rzpay.open();
        },
        [Razorpay, user?.email, user?.firstName]
    );

    if (!user) {
        return null;
    }

    return (
        <div className='add_credits'>
            <div>Credits {user.credits.toFixed(2)}</div>
            <div>
                <TextField
                    label='Amount'
                    type='number'
                    InputProps={{ inputProps: { min: 10, step: 1 } }}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <Button onClick={() => handlePayment(amount)}>Add</Button>
            </div>
        </div>
    );
}

export default AddCredits;
