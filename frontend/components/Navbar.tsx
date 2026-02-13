'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/profile', label: 'Profile' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-white font-bold text-lg">D</span>
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            Dev Logs
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/auth/login"
                            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <CloseOutlined className="text-xl" />
                        ) : (
                            <MenuOutlined className="text-xl" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border">
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/auth/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-center font-medium transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
