
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
  BarChart,
  PenSquare,
  ChevronDown,
  GraduationCap,
  FileCheck,
  CalendarDays
} from 'lucide-react'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

const isActive = (pathname: string, path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-3 w-full text-sidebar-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-base leading-none">CMS360</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Architectures</span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarMenu className="gap-1 px-2">
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="font-bold text-sm">HOME</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            {/* NEW IELTS CENTER */}
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton
                    className="group"
                    isActive={isActive(pathname, '/exam-service/ielts')}
                    tooltip="IELTS Center"
                  >
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">IELTS CENTER</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l pl-2 mt-1 space-y-0.5">
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/exam-service/ielts/dashboard')}><Link href="/exam-service/ielts/dashboard" className="text-xs font-bold">EXAM HUB</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/exam-service/ielts/builder')}><Link href="/exam-service/ielts/builder" className="text-xs font-medium">BUILDER</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/question-bank/ielts-questions/upload')}><Link href="/question-bank/ielts-questions/upload" className="text-xs font-medium">IMPORT SETS</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/question-bank/ielts-questions')}><Link href="/question-bank/ielts-questions" className="text-xs font-medium">MANAGE BANK</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/exam-service/ielts/listening-mapper')}><Link href="/exam-service/ielts/listening-mapper" className="text-xs font-medium opacity-60">TOOLS</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(pathname, '/class-creation')} tooltip="Class Creation">
                    <Link href="/class-creation" className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-bold text-sm">CLASS CREATION</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton
                    className="group"
                    isActive={isActive(pathname, '/content-management')}
                  >
                        <FolderKanban className="h-4 w-4" />
                        <span className="font-medium text-sm">Content</span>
                        <ChevronDown className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l pl-2 mt-1">
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/content-management/courses')}><Link href="/content-management/courses" className="text-xs font-medium">Courses</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/content-management/chapters')}><Link href="/content-management/chapters" className="text-xs font-medium">Chapters</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/content-management/all-content/fb-live')}><Link href="/content-management/all-content/fb-live" className="text-xs font-medium">FB Live</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            
            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton
                    className="group"
                    isActive={isActive(pathname, '/question-bank')}
                  >
                      <BarChart className="h-4 w-4" />
                      <span className="font-medium text-sm">Question Bank</span>
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l pl-2 mt-1">
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/question-bank/mcq-questions')}><Link href="/question-bank/mcq-questions" className="text-xs font-medium">MCQ Questions</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/question-bank/cq-questions')}><Link href="/question-bank/cq-questions" className="text-xs font-medium">CQ Questions</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/question-bank/bulk-upload')}><Link href="/question-bank/bulk-upload" className="text-xs font-medium">Bulk Upload</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton
                    className="group"
                    isActive={isActive(pathname, '/exam-service')}
                  >
                      <PenSquare className="h-4 w-4" />
                      <span className="font-medium text-sm">Legacy Exam</span>
                      <ChevronDown className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 border-l pl-2 mt-1">
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/exam-service/mcq')}><Link href="/exam-service/mcq" className="text-xs font-medium">MCQ Service</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                    <SidebarMenuSubItem><SidebarMenuSubButton asChild isActive={isActive(pathname, '/exam-service/cq')}><Link href="/exam-service/cq" className="text-xs font-medium">CQ Service</Link></SidebarMenuSubButton></SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
