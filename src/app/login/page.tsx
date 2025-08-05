import { cookies } from "next/headers";
import { LoginPage } from "./components";
import { redirect } from "next/navigation";
import { saveCookie } from "./actions";

const Page = async () => {
  return <LoginPage save={(token, branch, merchant) => {
    saveCookie(token, branch, merchant)
    redirect('/')
  }}/>;
};

export default Page;
