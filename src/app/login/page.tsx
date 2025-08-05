import { cookies } from "next/headers";
import { LoginPage } from "./components";
import { redirect } from "next/navigation";
import { saveCookie } from "./actions";

const Page = async () => {
  const handleLogin = async (props: any) => {
    "use server";
    // await saveCookie(props.token, props.branch, props.merchant);
    const cookieStore = await cookies();
    cookieStore.set("token", props.token);
    cookieStore.set("branch_id", props.branch);
    cookieStore.set("merchant_id", props.merchant);
    redirect("/");
  };
  return <LoginPage save={handleLogin} />;
};

export default Page;
