import React, { useState } from 'react';
import { X, CreditCard, Lock, Loader2, CheckCircle, Zap } from 'lucide-react';

interface MockPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    price: number;
    planName: string;
}

const MockPaymentModal: React.FC<MockPaymentModalProps> = ({ isOpen, onClose, onConfirm, price, planName }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'method' | 'form' | 'success'>('method');
    const [method, setMethod] = useState<'card' | 'gpay' | 'apple' | 'paypal'>('card');

    // Interactive Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, '').substring(0, 16);
        const matches = v.match(/.{1,4}/g);
        return matches ? matches.join(' ') : v;
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) return `${v.substring(0, 2)}/${v.substring(2)}`;
        return v;
    };

    if (!isOpen) return null;

    const handleMethodSelect = (selected: 'card' | 'gpay' | 'apple' | 'paypal') => {
        setMethod(selected);
        setStep('form');
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            await onConfirm();
            setStep('success');
            // Auto close after success
            setTimeout(() => {
                onClose();
                setStep('method'); // Reset for next time
            }, 2000);
        } catch (error) {
            console.error("Payment failed", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X size={20} />
                </button>

                {step === 'method' && (
                    <div className="p-6">
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-gray-800">Select Payment Method</h3>
                            <p className="text-sm text-gray-500">Secure simulated checkout</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 flex justify-between items-center">
                            <span className="font-medium text-gray-700">{planName}</span>
                            <span className="font-bold text-xl text-emerald-600">${price.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => handleMethodSelect('card')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-white"><CreditCard size={20} /></div>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-700">Credit / Debit Card</span>
                                    <span className="text-xs text-gray-400">Visa, Mastercard, Amex</span>
                                </div>
                            </button>

                            <button onClick={() => handleMethodSelect('gpay')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-white font-bold">G</div>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-700">Google Pay</span>
                                </div>
                            </button>

                            <button onClick={() => handleMethodSelect('apple')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-white font-bold"></div>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-700">Apple Pay</span>
                                </div>
                            </button>

                            <button onClick={() => handleMethodSelect('paypal')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-white italic font-bold">P</div>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-700">PayPal</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'form' && (
                    <form onSubmit={handlePay} className="p-6">
                        <button type="button" onClick={() => setStep('method')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center gap-1">
                            &larr; Back
                        </button>

                        <div className="mb-6 text-center mt-2">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 transition-transform transform hover:scale-110">
                                {method === 'card' ? <CreditCard size={20} /> : <Lock size={20} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {method === 'card' ? 'Enter Card Details' : `Pay with ${method === 'gpay' ? 'Google Pay' : method === 'apple' ? 'Apple Pay' : 'PayPal'}`}
                            </h3>
                            <p className="text-sm text-gray-500">Test Mode &bull; No real charge</p>
                        </div>

                        {method === 'card' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Card Number</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            required
                                            value={cardNumber}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-gray-700 placeholder-gray-300"
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            required
                                            value={expiry}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-gray-700 placeholder-gray-300"
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">CVC</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                type="password"
                                                placeholder="123"
                                                maxLength={4}
                                                required
                                                value={cvc}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-gray-700 placeholder-gray-300"
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-center bg-gray-50 py-2 rounded-lg">
                                    <Lock size={12} />
                                    <span>256-bit SSL Encrypted Connection</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:bg-gray-100 transition cursor-pointer" onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()}>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-400">
                                    <Zap size={24} />
                                </div>
                                <p className="text-gray-600 font-medium">Connecting to {method === 'gpay' ? 'Google Pay' : method === 'apple' ? 'Apple Pay' : 'PayPal'}...</p>
                                <p className="text-gray-400 text-xs mt-1">Click "Pay Now" to complete simulation.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> :
                                <>
                                    <span>Pay ${price.toFixed(2)}</span>
                                    <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded ml-1 group-hover:bg-gray-700">TEST</span>
                                </>
                            }
                        </button>
                    </form>
                )}

                {step === 'success' && (
                    <div className="p-10 text-center flex flex-col items-center justify-center animate-scale-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                        <p className="text-gray-500">Redirecting you back...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockPaymentModal;
