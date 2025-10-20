'use client';

import { useState } from 'react';
import Link from 'next/link';

import { playgroundItems } from '@/data';
import { SubItem } from '@/types';
import { useAuth } from '@/hooks';

import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);
  const { profile, isInitialized } = useAuth();

  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleSubItem = (key: string) => {
    setExpandedSubItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // Handle report issue
  const handleReportIssue = () => {
    window.open('https://forms.gle/y8GzM5HxdVd8stjo6', '_blank');
    setIsMobileMenuOpen(false); // ปิด mobile menu หลังจากคลิก
  };

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="rounded-lg border border-gray-200 p-1.5 transition-all duration-200 hover:bg-gray-50"
      >
        {isMobileMenuOpen ? (
          <X size={18} className="text-gray-600" />
        ) : (
          <Menu size={18} className="text-gray-600" />
        )}
      </Button>

      {/* Mobile Menu Dropdown  */}
      <div
        className={`absolute top-full right-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-4 opacity-0'
        } `}
      >
        <div className="max-h-[70vh] overflow-y-auto px-4 py-6">
          <div className="space-y-4">
            {/* Mobile Playground Items */}
            {playgroundItems.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                {item.href ? (
                  // Direct link item (Tutorial)
                  <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-lg px-3 py-3 text-left font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </Button>
                  </Link>
                ) : (
                  // Submenu item
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory(index)}
                      className="w-full justify-between rounded-lg px-3 py-3 text-left font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      {expandedCategories.includes(index) ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
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
                                  className="w-full justify-start rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-100"
                                >
                                  {subItem.label}
                                </Button>
                              </Link>
                            ) : (
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  onClick={() => toggleSubItem(`${index}-${subIndex}`)}
                                  className="w-full justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                                >
                                  {subItem.label}
                                  {expandedSubItems.includes(`${index}-${subIndex}`) ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
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
                                          className="mt-2 mb-2 w-full justify-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs transition-all duration-200 hover:bg-gray-50"
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

            {/* Other Links */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {isInitialized && profile && (
                <Link href="/course" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="mb-2 w-full justify-start rounded-lg border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
                  >
                    Course
                  </Button>
                </Link>
              )}
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-lg border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
