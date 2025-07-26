import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Label htmlFor="name">name</Label>
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
      <Button>submit</Button>
    </div>
  );
}
