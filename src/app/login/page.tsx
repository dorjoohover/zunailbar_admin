import { LoginPage } from "./components";

const Page = async () => {
  return (
    <section className="fixed top-0 left-0 custom-bg h-screen w-screen flex-center bg-cover bg-no-repeat p-4">
      <div className="max-w-lg bg-white border backdrop-blur-md p-10 rounded-3xl space-y-10 w-full shadow-xl border-slate-600">
        <h1 className="text-2xl font-bold text-center">Zu Nailbar</h1>
        <LoginPage
        // save={(token, branch, merchant) => handleLogin(token, branch, merchant)}
        />
      </div>
    </section>
  );
};

export default Page;
