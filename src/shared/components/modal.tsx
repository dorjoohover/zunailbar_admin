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
import { ACTION } from "@/lib/constants";
import { Loader2Icon } from "lucide-react";

import {
  BaseSyntheticEvent,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
export const Modal = ({
  name = "Open",
  title = "Title",
  btn = <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />,
  description,
  children,
  submit,
  open,
  setOpen,
  loading,
  reset,
}: {
  name?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  btn?: ReactNode;
  submit?: () => void;
  reset?: () => void;
  open: boolean;
  loading?: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submit) {
      submit();
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="outline">{name}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {submit && (
            <Button onClick={(e) => handleSubmit(e)}>
              {loading && btn}
              {loading ? "Please wait..." : "Submit"}
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
