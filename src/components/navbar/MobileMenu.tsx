'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

import { playgroundItems } from '@/data';
import { SubItem } from '@/types';
import { useAuth } from '@/hooks';

import { Menu, X, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import { useLogout } from '@/query';
import { clearAllCookies, getErrorMessage, logError } from '@/lib';
import Image from 'next/image';

const MobileMenu = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, isInitialized, clearAuthData } = useAuth();
  const logoutMutation = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = useCallback((index: number) => {
    setExpandedCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }, []);

  const toggleSubItem = useCallback((key: string) => {
    setExpandedSubItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Handle report issue
  const handleReportIssue = useCallback(() => {
    window.open('https://forms.gle/y8GzM5HxdVd8stjo6', '_blank');
    setIsMobileMenuOpen(false); // ปิด mobile menu หลังจากคลิก
  }, []);

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutMutation.mutateAsync();
      clearAuthData();
      clearAllCookies();

      toast.success('Logged out successfully');

      // Refresh the page after successful logout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logError('Logout failed:', error);
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="border-border hover:bg-muted rounded-lg border p-1.5 transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <X size={18} className="text-foreground" />
          ) : (
            <Menu size={18} className="text-foreground" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Dropdown - Render via Portal */}
      {mounted &&
        isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="border-border bg-background fixed inset-x-0 top-[72px] z-[10000] border-t shadow-2xl md:hidden">
            <div className="max-h-[80vh] overflow-y-auto px-4 py-6">
              <div className="space-y-4">
                {/* Profile Section (If Authenticated) */}
                {isInitialized && profile && (
                  <div className="border-border bg-muted/30 mb-6 flex items-center space-x-3 rounded-xl border p-4">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      {profile.profile_img ? (
                        <Image
                          src={profile.profile_img}
                          alt={profile.firstname}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-primary flex h-full w-full items-center justify-center rounded-full text-white">
                          {profile.firstname.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate font-semibold">
                        {profile.firstname} {profile.lastname}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">{profile.email}</div>
                    </div>
                  </div>
                )}

                {/* Mobile Playground Items */}
                {playgroundItems.map((item, index) => (
                  <div key={index} className="border-border border-b pb-4 last:border-b-0">
                    {item.href ? (
                      // Direct link item (Tutorial)
                      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="text-foreground hover:bg-muted w-full justify-start rounded-lg px-3 py-3 text-left font-medium"
                        >
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-muted-foreground text-sm">{item.description}</div>
                          </div>
                        </Button>
                      </Link>
                    ) : (
                      // Submenu item
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => toggleCategory(index)}
                          className="text-foreground hover:bg-muted w-full justify-between rounded-lg px-3 py-3 text-left font-medium"
                        >
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-muted-foreground text-sm">{item.description}</div>
                          </div>
                          {expandedCategories.includes(index) ? (
                            <ChevronUp size={16} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={16} className="text-muted-foreground" />
                          )}
                        </Button>

                        {/* Category Items */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedCategories.includes(index)
                              ? 'mt-2 max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
                          } `}
                        >
                          <div className="space-y-2 pl-4">
                            {item.items?.map((subItem, subIndex) => (
                              <div key={subIndex}>
                                {!subItem.hasSubItems ? (
                                  <Link
                                    href={subItem.href ?? '#'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <Button
                                      variant="ghost"
                                      className="border-border bg-muted hover:bg-muted/80 w-full justify-start rounded-lg border px-3 py-2 text-sm transition-all duration-200"
                                    >
                                      {subItem.label}
                                    </Button>
                                  </Link>
                                ) : (
                                  <div className="space-y-1">
                                    <Button
                                      variant="ghost"
                                      onClick={() => toggleSubItem(`${index}-${subIndex}`)}
                                      className="text-foreground hover:bg-muted w-full justify-between rounded-lg px-3 py-2 text-sm font-medium"
                                    >
                                      {subItem.label}
                                      {expandedSubItems.includes(`${index}-${subIndex}`) ? (
                                        <ChevronUp size={14} className="text-muted-foreground" />
                                      ) : (
                                        <ChevronDown size={14} className="text-muted-foreground" />
                                      )}
                                    </Button>

                                    <div
                                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        expandedSubItems.includes(`${index}-${subIndex}`)
                                          ? 'max-h-48 opacity-100'
                                          : 'max-h-0 opacity-0'
                                      } `}
                                    >
                                      <div className="space-y-1 pl-4">
                                        {subItem.subItems?.map((nestedItem: SubItem) => (
                                          <Link
                                            key={nestedItem.href}
                                            href={nestedItem.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                          >
                                            <Button
                                              variant="ghost"
                                              className="border-border bg-background hover:bg-muted mt-2 mb-2 w-full justify-start rounded-lg border px-3 py-2 text-xs transition-all duration-200"
                                            >
                                              {nestedItem.label}
                                            </Button>
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Theme Toggle */}
                <div className="border-border border-t pt-4">
                  <div className="mb-4 flex items-center justify-between px-3">
                    <span className="text-foreground text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>

                {/* Other Links */}
                <div className="border-border space-y-2 border-t pt-4">
                  {isInitialized && profile && (
                    <Link href="/course" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="border-border bg-background text-foreground hover:bg-muted mb-2 w-full justify-start rounded-lg border px-4 py-3 font-medium transition-all duration-200"
                      >
                        Course
                      </Button>
                    </Link>
                  )}
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="border-border bg-background text-foreground hover:bg-muted w-full justify-start rounded-lg border px-4 py-3 font-medium transition-all duration-200"
                    >
                      About us
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={handleReportIssue}
                    className="bg-error hover:bg-error/90 mt-6 w-full justify-start rounded-lg px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:text-white hover:shadow-md"
                  >
                    <span>Report Issue</span>
                  </Button>

                  {isInitialized && profile && (
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-error hover:bg-error/5 border-error/20 mt-2 w-full justify-center rounded-lg border px-4 py-3 font-medium transition-all duration-200"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>Logging out...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-500">
                          <LogOut size={18} />
                          <span>Logout</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
});

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu;
