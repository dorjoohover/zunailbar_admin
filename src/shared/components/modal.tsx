"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2Icon, Plus } from "lucide-react";

import { Dispatch, ReactNode, SetStateAction } from "react";
export const Modal = ({
  name = "Open",
  title = "Title",
  btn = <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />,
  description,
  children,
  submit,
  submitTxt = "Submit",
  open,
  setOpen,
  loading,
  w = "sm",
  reset,
}: {
  name?: string;
  title?: string;
  description?: string;
  submitTxt?: string;
  w?: string;
  children?: ReactNode;
  btn?: ReactNode;
  submit?: () => void;
  reset?: () => void;
  open: boolean;
  loading?: boolean;
  setOpen: Dispatch<SetStateAction<boolean | undefined>>;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submit) {
      submit();
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      {name && name !== "" && (
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="cursor-pointer uppercase text-xs font-bold"
          >
            <Plus />
            {name}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className={`max-w-${w}`}>
        <DialogHeader className="mb-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{children}</div>
        <DialogFooter className="mt-3">
          <DialogClose asChild>
            <Button variant="outline" className="bg-white">Цуцлах</Button>
          </DialogClose>
          {submit && (
            <Button onClick={(e) => handleSubmit(e)}>
              {loading && btn}
              {loading ? "Please wait..." : submitTxt}
            </Button>
          )}
          {reset && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                reset();
              }}
            >
              reset
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
