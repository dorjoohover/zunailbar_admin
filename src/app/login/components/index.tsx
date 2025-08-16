"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ILoginUser } from "@/models";
import { login } from "@/app/(api)/auth";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/shared/components/password.field";

const formSchema = z.object({
  mobile: z.string().min(2, {
    message: "mobile must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "password must be at least 2 characters.",
  }),
});

export function LoginPage() {
  // {
  // save,
  // }: {
  // save: (token: string, branch: string, merchant: string) => void;
  // }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });
  const router = useRouter();
  const save = async (token: string, branch: string, merchant: string) => {
    await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        branch,
        merchant,
      }),
    });
    // router.push("/");
    window.location.href = "/";
    router.refresh();
  };
  const onSubmit = async (value: ILoginUser) => {
    const { data, error } = await login(value);
    console.log(data, error);
    save(data.accessToken, data.branch_id, data.merchant_id);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Утасны дугаар</FormLabel>
              <FormControl>
                <Input
                  placeholder="xxxx-xxxx"
                  {...field}
                  className="bg-white h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <PasswordField
                props={{ ...field }}
                className="bg-white h-10"
                label="Нууц үг"
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-10">
          Нэвтрэх
        </Button>
      </form>
    </Form>
  );
}
