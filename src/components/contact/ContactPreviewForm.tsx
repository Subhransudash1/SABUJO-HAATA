'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactPreviewForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const product = searchParams.get('product');
    const qty = searchParams.get('qty');
    const unit = searchParams.get('unit');

    if (product) {
      const unitStr = unit === 'kg' ? 'kg' : unit === 'piece' ? 'pieces' : unit || 'units';
      const qtyStr = qty ? `${qty} ${unitStr}` : 'bulk quantity';
      setMessage(
        `Hello Sabuja Haata team,\n\nI would like to place a bulk order enquiry for ${product} (${qtyStr}). Please let me know availability, bulk pricing, and delivery arrangements.\n\nThank you!`
      );
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-[#77A96B] bg-[#EEF4E9]/40 p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-8 w-8 text-[#245C3A]" />
        <h3 className="font-display text-lg font-semibold text-[#173D2A]">
          Message Received (Frontend Preview)
        </h3>
        <p className="text-xs sm:text-sm text-[#697269]">
          Thank you, {name}. Real message sending and email notifications will be activated upon backend connection.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setMessage('');
          }}
          className="text-xs font-semibold text-[#245C3A] underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-xs font-semibold text-[#202820] mb-1">
          Your Name *
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Subrat Das"
          className="h-10 w-full rounded-lg border border-[#E5E8DF] bg-white px-3 text-xs sm:text-sm text-[#202820] focus:border-[#245C3A]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold text-[#202820] mb-1">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="h-10 w-full rounded-lg border border-[#E5E8DF] bg-white px-3 text-xs sm:text-sm text-[#202820] focus:border-[#245C3A]"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#202820] mb-1">
            Mobile Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="h-10 w-full rounded-lg border border-[#E5E8DF] bg-white px-3 text-xs sm:text-sm text-[#202820] focus:border-[#245C3A]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-[#202820] mb-1">
          Your Message / Produce Enquiry *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about bulk produce, morning delivery slots, or seasonal availability..."
          className="w-full rounded-lg border border-[#E5E8DF] bg-white p-3 text-xs sm:text-sm text-[#202820] focus:border-[#245C3A]"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#245C3A] px-5 text-xs font-semibold text-white hover:bg-[#173D2A] transition-colors cursor-pointer"
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Submit Enquiry (Preview)</span>
      </button>
    </form>
  );
}
