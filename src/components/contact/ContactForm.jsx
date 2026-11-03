"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-context";

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      toast.success("Pesan Anda telah berhasil dikirim! Tim kami akan segera merespons.");
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Info Cards (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="size-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Head Office</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Modesy Digital Commerce Tower, Lt. 18<br />
              Jl. Jend. Sudirman Kav. 45-46, Jakarta Pusat 10210
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="size-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Email Address</h3>
            <p className="text-xs text-gray-500 mt-1">
              support@modesy.com<br />
              business@modesy.com
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="size-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Phone className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Call Center</h3>
            <p className="text-xs text-gray-500 mt-1">
              +62 (21) 5082-9900<br />
              Senin - Jumat, 08:00 - 18:00 WIB
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex items-start gap-4">
          <div className="size-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Response Time</h3>
            <p className="text-xs text-gray-500 mt-1">
              Rata-rata respons tim kami adalah kurang dari 24 jam kerja.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form (7 Cols) */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Send Us a Message
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Fill in the form below and our team will get back to you shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name" className="text-xs font-semibold">
                Nama Lengkap *
              </Label>
              <Input
                id="contact-name"
                required
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contact-email" className="text-xs font-semibold">
                Alamat Email *
              </Label>
              <Input
                id="contact-email"
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact-subject" className="text-xs font-semibold">
              Subjek Pertanyaan
            </Label>
            <Input
              id="contact-subject"
              placeholder="Contoh: Pertanyaan seputar pesanan atau toko"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="contact-message" className="text-xs font-semibold">
              Pesan Anda *
            </Label>
            <Textarea
              id="contact-message"
              required
              rows={5}
              placeholder="Tuliskan pertanyaan atau kendala Anda secara rinci..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Send className="size-4" />
            <span>{isSubmitting ? "Mengirim..." : "Kirim Pesan"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
