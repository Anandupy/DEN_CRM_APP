'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardCard from '@/components/ui/DashboardCard';
import DataTable from '@/components/ui/DataTable';
import FormInput from '@/components/ui/FormInput';
import { createInventoryTransaction, loadSupplementInventory, saveSupplementProduct } from '@/lib/erp/data';
import type { InventoryTransactionRecord, SupplementProduct } from '@/lib/erp/types';
import { Boxes, PackagePlus, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplementsPage() {
  const [products, setProducts] = useState<SupplementProduct[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    productName: '',
    sku: '',
    category: 'Protein',
    costPrice: '0',
    sellingPrice: '0',
    quantity: '0',
    reorderLevel: '5',
  });
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: '1',
  });

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const inventory = await loadSupplementInventory();
      setProducts(inventory.products);
      setTransactions(inventory.transactions);
      if (!saleForm.productId && inventory.products[0]) {
        setSaleForm((current) => ({ ...current, productId: inventory.products[0].id }));
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalStockValue = useMemo(
    () => products.reduce((sum, product) => sum + product.quantity * product.costPrice, 0),
    [products]
  );
  const potentialRevenue = useMemo(
    () => products.reduce((sum, product) => sum + product.quantity * product.sellingPrice, 0),
    [products]
  );

  const handleSaveProduct = async () => {
    try {
      setIsSavingProduct(true);
      await saveSupplementProduct({
        productName: form.productName,
        sku: form.sku,
        category: form.category,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
      });
      toast.success('Supplement saved');
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save supplement');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSale = async () => {
    try {
      setIsSavingSale(true);
      const selected = products.find((product) => product.id === saleForm.productId);
      if (!selected) {
        toast.error('Select a product first');
        return;
      }
      await createInventoryTransaction({
        productId: saleForm.productId,
        quantity: Number(saleForm.quantity),
        unitPrice: selected.sellingPrice,
        type: 'sale',
      });
      toast.success('Sale recorded');
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to record sale');
    } finally {
      setIsSavingSale(false);
    }
  };

  return (
    <AppLayout activePath="/owner/supplements">
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Supplement Inventory</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage products, stock purchases, sales, and potential profit.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard label="Products" value={products.length} icon={Boxes} tone="info" />
          <DashboardCard label="Stock Quantity" value={products.reduce((sum, product) => sum + product.quantity, 0)} icon={PackagePlus} tone="default" />
          <DashboardCard label="Stock Value" value={`₹${totalStockValue.toLocaleString('en-IN')}`} icon={ShoppingCart} tone="warning" />
          <DashboardCard label="Potential Revenue" value={`₹${potentialRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} tone="success" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">Add Product</h2>
              {loadError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {loadError}
                </div>
              ) : null}
              <FormInput label="Product Name" value={form.productName} onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))} />
              <FormInput label="SKU" value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
              <FormInput label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              <FormInput label="Cost Price" type="number" value={form.costPrice} onChange={(event) => setForm((current) => ({ ...current, costPrice: event.target.value }))} />
              <FormInput label="Selling Price" type="number" value={form.sellingPrice} onChange={(event) => setForm((current) => ({ ...current, sellingPrice: event.target.value }))} />
              <FormInput label="Opening Quantity" type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              <FormInput label="Reorder Level" type="number" value={form.reorderLevel} onChange={(event) => setForm((current) => ({ ...current, reorderLevel: event.target.value }))} />
              <button onClick={handleSaveProduct} disabled={isSavingProduct} className="btn-primary w-full justify-center disabled:opacity-60">
                {isSavingProduct ? 'Saving...' : 'Save Product'}
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">Record Sale</h2>
              <label className="flex flex-col gap-1.5">
                <span className="form-label">Product</span>
                <select
                  value={saleForm.productId}
                  onChange={(event) => setSaleForm((current) => ({ ...current, productId: event.target.value }))}
                  className="form-input text-sm"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </label>
              <FormInput label="Quantity Sold" type="number" value={saleForm.quantity} onChange={(event) => setSaleForm((current) => ({ ...current, quantity: event.target.value }))} />
              <button onClick={handleSale} disabled={isSavingSale || isLoading} className="btn-secondary w-full justify-center disabled:opacity-60">
                {isSavingSale ? 'Recording...' : 'Record Sale'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-10 text-sm text-zinc-500">
                Loading live inventory...
              </div>
            ) : (
              <DataTable
                rows={products}
                columns={[
                  { key: 'product', title: 'Product', render: (row) => <div><p className="text-zinc-200 font-medium">{row.productName}</p><p className="text-xs text-zinc-600">{row.sku}</p></div> },
                  { key: 'category', title: 'Category', render: (row) => <span className="text-zinc-300">{row.category}</span> },
                  { key: 'quantity', title: 'Qty', render: (row) => <span className="text-zinc-300">{row.quantity}</span> },
                  { key: 'cost', title: 'Cost', render: (row) => <span className="text-zinc-300">₹{row.costPrice.toLocaleString('en-IN')}</span> },
                  { key: 'selling', title: 'Selling', render: (row) => <span className="text-zinc-300">₹{row.sellingPrice.toLocaleString('en-IN')}</span> },
                  { key: 'profit', title: 'Profit / Unit', render: (row) => <span className="text-emerald-400">₹{row.profitPerUnit.toLocaleString('en-IN')}</span> },
                ]}
                emptyState="No supplement inventory added yet."
              />
            )}

            <DataTable
              rows={transactions}
              columns={[
                { key: 'product', title: 'Product', render: (row) => <span className="text-zinc-200">{row.productName}</span> },
                { key: 'type', title: 'Type', render: (row) => <span className="text-zinc-300 capitalize">{row.transactionType}</span> },
                { key: 'qty', title: 'Qty', render: (row) => <span className="text-zinc-300">{row.quantity}</span> },
                { key: 'price', title: 'Unit Price', render: (row) => <span className="text-zinc-300">₹{row.unitPrice.toLocaleString('en-IN')}</span> },
                { key: 'date', title: 'Date', render: (row) => <span className="text-zinc-400">{row.transactionDate}</span> },
              ]}
              emptyState="Recent stock movements will appear here."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
