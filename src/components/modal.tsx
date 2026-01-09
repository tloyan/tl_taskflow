"use client";

import { ReactNode } from "react";
import { Dialog, DialogOverlay, DialogContent, DialogTitle } from "./ui/dialog";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Modal({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <DialogContent>{children}</DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
