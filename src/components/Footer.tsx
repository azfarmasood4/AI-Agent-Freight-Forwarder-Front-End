import { Mail, Globe, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--ahs-primary-dark)] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">AHS Pakistan</h3>
            <p className="text-sm opacity-90 mb-4">
              Your trusted freight forwarding partner, providing reliable and cost-effective shipping solutions worldwide.
            </p>
            <p className="text-xs opacity-75">
              © 2024 AHS Pakistan. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-90 hover:opacity-100 transition-opacity">
                <a href="/chat">AI-Powered Quotations</a>
              </li>
              <li className="opacity-90 hover:opacity-100 transition-opacity">
                <a href="/rates">Real-time Rate Search</a>
              </li>
              <li className="opacity-90 hover:opacity-100 transition-opacity">
                Ocean Freight Forwarding
              </li>
              <li className="opacity-90 hover:opacity-100 transition-opacity">
                24/7 Customer Support
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 opacity-90">
                <Mail className="h-4 w-4" />
                <span>afnan.sid0@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 opacity-90">
                <Globe className="h-4 w-4" />
                <span>www.ahspakistan.com</span>
              </li>
              <li className="flex items-center space-x-2 opacity-90">
                <Phone className="h-4 w-4" />
                <span>Contact for Booking</span>
              </li>
              <li className="flex items-center space-x-2 opacity-90">
                <MapPin className="h-4 w-4" />
                <span>Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[var(--ahs-primary)] text-center text-xs opacity-75">
          <p>AI-Powered Freight Forwarding Solutions - Built with ❤️ for AHS Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
