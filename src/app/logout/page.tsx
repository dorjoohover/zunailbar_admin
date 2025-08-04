import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const Page = async () => {
  const store = await cookies();
  store.delete("branch_id");
  store.delete("merchant_id");
  store.delete("token");

  redirect("/login");
};

export default Page;
