"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle } from "./ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Modal({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Capture initial pathname once using initializer function
  const [initialPathname] = useState(() => pathname);

  // Modal is open only if we're still on the initial pathname
  const isOpen = pathname === initialPathname;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <DialogContent>{children}</DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
