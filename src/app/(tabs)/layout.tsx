import TabBar from "@/components/shared/tab-bar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <TabBar />
    </div>
  );
}
