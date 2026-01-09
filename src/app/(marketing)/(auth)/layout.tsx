import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-svh flex-1">
      <div className="p-6 md:p-10">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="grow flex flex-col items-center justify-center gap-6 p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
