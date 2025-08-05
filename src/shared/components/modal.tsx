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
import { Loader2Icon } from "lucide-react";

import { BaseSyntheticEvent, ReactNode, useState } from "react";
export const Modal = ({
  name = "Open",
  title = "Title",
  btn = <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />,
  description,
  children,
  submit,
}: {
  name?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  btn?: ReactNode;
  submit?: () => Promise<boolean>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submit) {
      setIsLoading(true);
      const res = await submit();
      setIsLoading(false);
      if (res) setOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              {isLoading && btn}
              {isLoading ? "Please wait..." : "Submit"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
