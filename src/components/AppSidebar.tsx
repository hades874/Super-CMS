
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  FolderKanban,
  BarChart2,
  PenSquare,
  ChevronDown,
  GraduationCap,
  CalendarDays,
  BookOpen,
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

const isActive = (pathname: string, path: string) =>
  pathname === path || (path !== '/' && pathname.startsWith(path))

const NAV_ITEMS = [
  {
    type: 'link' as const,
    href: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
  },
  {
    type: 'collapsible' as const,
    href: '/exam-service/ielts',
    label: 'IELTS Center',
    icon: GraduationCap,
    children: [
      { href: '/exam-service/ielts/dashboard', label: 'Exam Hub' },
      { href: '/exam-service/ielts/builder', label: 'Builder' },
      { href: '/question-bank/ielts-questions/upload', label: 'Import Sets' },
      { href: '/question-bank/ielts-questions', label: 'Manage Bank' },
      { href: '/exam-service/ielts/listening-mapper', label: 'Tools' },
    ],
  },
  {
    type: 'link' as const,
    href: '/class-creation',
    label: 'Class Creation',
    icon: CalendarDays,
  },
  {
    type: 'collapsible' as const,
    href: '/content-management',
    label: 'Content',
    icon: FolderKanban,
    children: [
      { href: '/content-management/courses', label: 'Courses' },
      { href: '/content-management/chapters', label: 'Chapters' },
      { href: '/content-management/all-content/fb-live', label: 'FB Live' },
    ],
  },
  {
    type: 'collapsible' as const,
    href: '/question-bank',
    label: 'Question Bank',
    icon: BarChart2,
    children: [
      { href: '/question-bank/mcq-questions', label: 'MCQ Questions' },
      { href: '/question-bank/cq-questions', label: 'CQ Questions' },
      { href: '/question-bank/bulk-upload', label: 'Bulk Upload' },
    ],
  },
  {
    type: 'collapsible' as const,
    href: '/exam-service',
    label: 'Exam Service',
    icon: PenSquare,
    children: [
      { href: '/exam-service/mcq', label: 'MCQ Service' },
      { href: '/exam-service/cq', label: 'CQ Service' },
    ],
  },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm leading-none">CMS360</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Architectures</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarMenu className="gap-0.5 px-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon

            if (item.type === 'link') {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <Collapsible key={item.href} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isActive(pathname, item.href)}
                      tooltip={item.label}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 text-muted-foreground" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 border-l pl-2 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(pathname, child.href)}
                          >
                            <Link href={child.href} className="text-xs font-medium">
                              {child.label}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
