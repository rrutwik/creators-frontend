import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import useRazorpay from 'react-razorpay';
import { useCallback } from 'react';
import { createOrder } from '../api';
import { RazorpayOptions } from 'react-razorpay';

function AddCredits({
    user,
}: {
    user: {
        email: string;
        name: string;
    } | null;
}) {
    const [amount, setAmount] = useState<number>(11);
    const [Razorpay] = useRazorpay();
    const handlePayment = useCallback(
        async (amount: number) => {
            const order = await createOrder({
                amount: amount,
            });
            const options: RazorpayOptions = {
                key: 'rzp_test_CPzPXBNjXARaEm',
                amount: Number(amount * 100).toFixed(2),
                currency: 'INR',
                name: 'Payment For Adding Credits of ' + amount,
                order_id: order.id,
                handler: function (response) {
                    console.log({
                        response,
                    });
                    // alert(response.razorpay_payment_id);
                    // alert(response.razorpay_order_id);
                    // alert(response.razorpay_signature);
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
            };
            console.log({
                options,
            });
            const rzpay = new Razorpay(options);
            rzpay.open();
        },
        [Razorpay, user?.email, user?.name]
    );

    if (!user) {
        return null;
    }

    return (
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
    );
}

export default AddCredits;
