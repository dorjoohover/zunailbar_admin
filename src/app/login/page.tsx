import { LoginPage } from "./components";

const Page = async () => {
  return (
    <section className="max-w-md mx-auto col-center h-full">
      <LoginPage
      // save={(token, branch, merchant) => handleLogin(token, branch, merchant)}
      />
    </section>
  );
};

export default Page;
