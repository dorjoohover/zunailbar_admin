"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./components/columns";
import { IProduct } from "@/models/product.model";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContainerHeader from "@/components/containerHeader";

const initialProduct: IProduct = {
  id: "1",
  brand_id: "1",
  category_id: "man",
  name: "Ягаан будаг",
  ref: "asd",
  quantity: 12,
  price: 15000,
  color: "Pink",
  size: "50ml",
  created_at: new Date("2025-07-20"),
};

const initialProducts: IProduct[] = Array.from({ length: 40 }, (_, i) => ({
  ...initialProduct,
  id: (i + 1).toString(),
  name: `Ягаан будаг ${i + 1}`,
}));

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const handleSave = () => {
    if (!editingProduct) return;
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    setEditingProduct(null);

    toast("Амжилттай хадгаллаа!", {});
  };

  const columns = getColumns(setEditingProduct);

  return (
    <div className="w-full">
      <div className="admin-container">
        <ContainerHeader title="Барааны жагсаалт" />
        <DataTable columns={columns} data={products} />
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Бараа засах</DialogTitle>
            </DialogHeader>

            {editingProduct && (
              <form action={""} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Нэр</label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Нэр" required />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Reference</label>
                  <Input value={editingProduct.ref} onChange={(e) => setEditingProduct({ ...editingProduct, ref: e.target.value })} placeholder="Reference" required />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Тоо ширхэг</label>
                  <Input type="number" value={editingProduct.quantity} onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })} placeholder="Тоо ширхэг" required />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Үнэ</label>
                  <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} placeholder="Үнэ" required />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Өнгө</label>
                  <Input value={editingProduct.color} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} placeholder="Өнгө" required />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Хэмжээ</label>
                  <Input value={editingProduct.size} onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })} placeholder="Хэмжээ" required />
                </div>

                <Button type="submit" onClick={handleSave}>
                  Хадгалах
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
