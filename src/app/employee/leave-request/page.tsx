
import DynamicHeader from "@/components/dynamicHeader";
import { Button } from "@/components/ui/button";
import Calendar04 from "@/components/calendar-04";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { columns, Payment } from "./components/column";
import { DataTable } from "./components/data-table";
import RequestFreeTime from "./components/reqFreeTime";



async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}

export default  async function Page() {
    const data = await getData()
  return (
    <section className="h-[calc(100vh-1rem)] flex flex-col">
      <DynamicHeader />

      <div className="lg:flex-1 flex flex-col-reverse lg:flex-row gap-3 relative lg:p-0 p-3">
        <div className="w-full p-0 lg:p-3 h-full">
          <div className="rounded-2xl bg-white h-full overflow-hidden relative">

            <ScrollArea className="h-full relative p-4">
            <div className="sticky top-0 left-0 bg-white w-full py-4"><h1>
              Чөлөө авсан өдөр</h1></div>
               <DataTable columns={columns} data={data} />
            </ScrollArea>
          </div>
        </div>

        <div className="hidden lg:flex max-w-xs w-full bg-white border-l p-5 lg:flex-col h-full justify-between">
          <RequestFreeTime />
        </div>
        <div className="block lg:hidden">
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button variant="default">Чөлөөний хүсэлт</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Чөлөө авах хүсэлт илгээх</DialogTitle>
                </DialogHeader>
                <RequestFreeTime />
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

