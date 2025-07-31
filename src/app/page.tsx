import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      {/* <Label htmlFor="name">name</Label>
      <Input type="name" id="name" placeholder="name" />
      <Label htmlFor="minValue">minValue</Label>
      <Input type="minValue" id="minValue" placeholder="minValue" />
      <Label htmlFor="maxValue">maxValue</Label>
      <Input type="maxValue" id="maxValue" placeholder="maxValue" />
      <Label htmlFor="startValue">startValue</Label>
      <Input type="startValue" id="startValue" placeholder="startValue" />
      <Label htmlFor="endValue">endValue</Label>
      <Input type="endValue" id="endValue" placeholder="endValue" />
      <Switch />
      <Button>submit</Button> */}
      <div className="w-full container py-2">
        <div className="flex gap-6">
          <div className="w-[60%] bg-[#e9a6b5] rounded-2xl min-h-[640px] flex items-end p-20">
            <button className="border p-4 border-black">Zahialga</button>
          </div>
          <div className="w-[40%] border border-black bg-[#e9a6b5] rounded-2xl min-h-[640px]"></div>
        </div>
        <div className="grid grid-cols-4 py-20 gap-6">
          <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Feature 1</div>
          <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Feature 2</div>
          <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Feature 3</div>
          <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Feature 4</div>
        </div>
        <div className="py-20 border-t border-black">
          <h1 className="text-5xl font-medium pb-10">Yu hiideg ve</h1>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="border border-black bg-[#e9a6b5] aspect-[16/9]"></div>
              <h1 className="font-medium text-2xl">Manicure</h1>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita, quam.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="border border-black bg-[#e9a6b5] aspect-[16/9]"></div>
              <h1 className="font-medium text-2xl">Pedicure</h1>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita, quam.</p>
            </div>
          </div>
        </div>
        <div className="py-20 flex-center flex-col">
          <div className="grid grid-cols-4 py-20 gap-6 w-full">
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Gelen budalt - une</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Smart humstai budal</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Pedicure</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Nuhult gar</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Nuhult hul</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Arilgalt</div>
            <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">Salgalt</div>
            {/* <div className="border border-black bg-[#e9a6b5] min-h-[150px] col-center">1</div> */}
          </div>
          <button className="border border-black bg-[#e9a6b5] rounded py-3 px-10">Button</button>
        </div>
      </div>
      <div className="bg-black py-20 h-screen col-center text-white">
        <div className="container space-y-10">
          <h1 className="text-4xl font-semibold">User reviews</h1>
          <p className="text-2xl font-medium">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt optio quia inventore mollitia rerum fugiat molestiae similique placeat fuga vel maiores modi ullam autem tenetur at quo, saepe laboriosam expedita!</p>
        </div>
      </div>
      <div className="container py-20">
        <div className="flex-center">
          <div className="flex flex-col p-10 pb-16 rounded-2xl gap-10 border border-black bg-[#e9a6b5] min-w-[50%] items-center">
            <h1 className="text-4xl font-semibold">Lorem, ipsum dolor.</h1>
            <div className="h-[1px] bg-black w-full"></div>
            <div className="flex-center flex-col w-full gap-3">
              <p>Lorem ipsum dolor sit amet.</p>
              <div className="flex gap-4 w-full">
                <input type="text" className="h-12 border w-full" />
                <button className="h-12 px-10 border border-black bg-[#e9a6b5]">button</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black py-20">
        <div className="container">
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-2 text-white h-64 col-center">
              <h1 className="text-4xl">Uilchilgeenii assistant</h1>
            </div>
            <div className="col-span-1 bg-[#e9a6b5] h-64">
              <h1>Assistance zurag || logo</h1>
            </div>
            <div className="col-span-2 text-white h-64 col-center items-start gap-4">
              <h1 className="text-3xl">Utasnii dugaar</h1>
              <button className="px-10 py-3 border border-white rounded-xl">Zalgah</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
