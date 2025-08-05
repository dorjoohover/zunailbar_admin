import { cookies } from "next/headers";
import { LoginPage } from "./components";
import { redirect } from "next/navigation";
export async function saveCookie(token: string, branch: string, merchant: string) {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("token", token);
  cookieStore.set("branch_id", branch);
  cookieStore.set("merchant_id", merchant);
  redirect("/");
}
const Page = async () => {
  return (
    <div className="size-full flex-center items-center">
      <div className="max-w-xs w-full">
        <LoginPage save={saveCookie} />
      </div>
    </div>
  );
};

export default Page;
