import TopBar from "./TopBar";

function AppLayout({
  searchPlaceholder,
  onSearch,
  user,
  children,
}) {

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      {/* <Sidebar
        active={active}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
      /> */}

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <TopBar
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
