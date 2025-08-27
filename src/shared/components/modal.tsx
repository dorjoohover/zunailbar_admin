"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2Icon, Plus } from "lucide-react";

import { ReactNode } from "react";

export const Modal = ({ name = "Нэмэх", title = "Title", btn = <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />, description, children, submit, submitTxt = "Submit", open, setOpen, loading, w = "md", maw = "sm", size, reset }: { name?: string; maw?: string; title?: string; description?: string; submitTxt?: string; w?: string; size?: string; children?: ReactNode; btn?: ReactNode; submit?: () => void; reset?: () => void; open: boolean; loading?: boolean; setOpen: (v: boolean) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submit) {
      submit();
    }
  };
  const mawClasses: Record<string, string> = {
    xs: "max-w-[calc(theme(maxWidth.xs)-1rem)]",
    sm: "max-w-[calc(theme(maxWidth.sm)-1rem)]",
    md: "max-w-[calc(theme(maxWidth.md)-1rem)]",
    lg: "max-w-[calc(theme(maxWidth.lg)-1rem)]",
    xl: "max-w-[calc(theme(maxWidth.xl)-1rem)]",
    "2xl": "max-w-[calc(theme(maxWidth.2xl)-1rem)]",
    "3xl": "max-w-[calc(theme(maxWidth.4xl)-1rem)]",
    "4xl": "max-w-[calc(theme(maxWidth.4xl)-1rem)]",
    "5xl": "max-w-[calc(theme(maxWidth.5xl)-1rem)]",
    "6xl": "max-w-[calc(theme(maxWidth.6xl)-1rem)]",
    "7xl": "max-w-[calc(theme(maxWidth.7xl)-1rem)]",
  };

  //   const mawClasses: Record<string, string> = {
  //   xs: "max-w-xs",
  //   sm: "max-w-sm",
  //   md: "max-w-md",
  //   lg: "max-w-lg",
  //   xl: "max-w-xl",
  //   "2xl": "max-w-2xl",
  //   "3xl": "max-w-3xl",
  //   "4xl": "max-w-4xl",
  //   "5xl": "max-w-5xl",
  //   "6xl": "max-w-6xl",
  //   "7xl": "max-w-7xl",
  // };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      {name && name !== "" && (
        <DialogTrigger asChild>
          <Button variant="default" className="cursor-pointer uppercase text-xs font-bold ml-1">
            <Plus />
            <span className="hidden md:block">{name}</span>
          </Button>
        </DialogTrigger>
      )}
      {/* <DialogContent className={`max-w-${maw} lg:max-w-${w}`}> */}
      <DialogContent className={cn(mawClasses[maw], "")}>
        <DialogHeader className="mb-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{children}</div>
        <DialogFooter className="mt-3">
          <DialogClose asChild>
            <Button variant="outline" className="bg-white">
              Цуцлах
            </Button>
          </DialogClose>
          {submit && (
            <Button onClick={(e) => handleSubmit(e)}>
              {loading && btn}
              {loading ? "Please wait..." : submitTxt}
            </Button>
          )}
          {/* {reset && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                reset();
              }}
            >
              reset
            </Button>
          )} */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
