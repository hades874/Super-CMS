
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ThemeProvider';
import { Inter } from 'next/font/google';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { AssignmentProvider } from '@/context/AssignmentContext';
import { AssignContentDialog } from '@/components/k12/AssignContentDialog';
import { IeltsRepositoryProvider } from '@/context/IeltsRepositoryContext';
import { ExamRepositoryProvider } from '@/context/ExamRepositoryContext';
import { ClassCreationProvider } from '@/context/ClassCreationContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CMS360',
  description: 'An Integrated Learning Platform for Content and Exam Management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full w-full">
      <body className={`${inter.variable} font-sans antialiased h-full w-full overflow-hidden flex flex-col`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
          <ClassCreationProvider>
          <IeltsRepositoryProvider>
            <ExamRepositoryProvider>
              <AssignmentProvider>
                <SidebarProvider className="w-full h-full">
                  <AppSidebar />
                  <SidebarInset className="bg-muted/20 flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                    <Header />
                    <div className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col">
                      {children}
                    </div>
                  </SidebarInset>
                </SidebarProvider>
                <Toaster />
                <AssignContentDialog />
              </AssignmentProvider>
            </ExamRepositoryProvider>
          </IeltsRepositoryProvider>
          </ClassCreationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
