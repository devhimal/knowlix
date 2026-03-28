"use client";
import { Facebook, Twitter, Instagram, ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card py-16 px-6">
      <div className="max-w-7xl mx-auto bg-secondary text-foreground  p-10 relative overflow-hidden">
        {/* Content */}
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Knowlix</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering students with organized academic resources, verified
              notes, and collaborative learning tools to improve study
              efficiency and knowledge sharing.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a className="hover:text-primary transition">
                <Twitter size={20} />
              </a>
              <a className="hover:text-primary transition">
                <Instagram size={20} />
              </a>
              <a className="hover:text-primary transition">
                <Facebook size={20} />
                
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Site Map</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Homepage
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Technology
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  News
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Academic</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Plus Two
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Bachelors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  CTEVT
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Notes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Past Papers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/privacy-policy" className="hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Community Rules
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>

            {/* Back to Top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 mt-6 text-sm border border-border px-3 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition"
            >
              <ArrowUp size={16} /> Back to Top
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Knowlix. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
