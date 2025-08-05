import { cookies } from "next/headers";
import { LoginPage } from "./components";
import { redirect } from "next/navigation";
import { saveCookie } from "./actions";

const Page = async () => {
  const handleLogin = async (props: any) => {
    await saveCookie(props.token, props.branch, props.merchant);
  };
  return (
    <LoginPage
      save={handleLogin}
    />
  );
};

export default Page;
