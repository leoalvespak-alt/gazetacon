import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
       <AdminSidebar />
       <div className="flex flex-col flex-1 pb-10 md:ml-64 transition-all">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 md:hidden">
             {/* Mobile Sidebar Trigger could go here */}
             <div className="font-bold">Menu Admin</div>
          </header>
          <main className="flex-1 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
          </main>
       </div>
    </div>
  )
}
