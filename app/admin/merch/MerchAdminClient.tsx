"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MerchItem, MerchOrder } from '@prisma/client';
import { deleteMerchItem, updateOrderStatus, deleteMerchOrder } from './actions';
import { Package, ShoppingCart, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface MerchAdminClientProps {
  items: MerchItem[];
  orders: (MerchOrder & { item: MerchItem })[];
}

export default function MerchAdminClient({ items, orders }: MerchAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'orders'>('items');

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-foreground/20">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-sans uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 w-fit">
            Supply Chain Management
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight leading-tight">
            The Supply.
          </h1>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={() => setActiveTab('items')}
             className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'items' ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground'}`}
           >
             Inventory
           </button>
           <button 
             onClick={() => setActiveTab('orders')}
             className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'orders' ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground'}`}
           >
             Orders ({orders.length})
           </button>
        </div>
      </header>

      {activeTab === 'items' ? (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif italic">Inventory Management</h2>
            <Link 
              href="/admin/merch/new"
              className="px-6 py-3 bg-accent text-black text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Add New Item
            </Link>
          </div>

          <div className="grid grid-cols-1 border border-foreground/10">
            {items.map((item) => (
              <div key={item.id} className="group grid grid-cols-1 md:grid-cols-12 gap-6 p-6 border-b border-foreground/10 last:border-b-0 hover:bg-[#eaddcf] transition-colors items-center">
                <div className="col-span-1 md:col-span-1">
                  <div className="w-12 h-12 bg-muted border border-foreground/10 overflow-hidden">
                    {item.images[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div className="col-span-5 flex flex-col">
                  <span className="font-serif italic text-xl group-hover:text-black">{item.title}</span>
                  <span className="text-[10px] font-mono uppercase text-foreground/40">{item.category} • {item.price} MAD</span>
                </div>
                <div className="col-span-2">
                   <span className={`text-[10px] font-mono px-2 py-1 uppercase tracking-widest border ${item.isActive ? 'border-green-500/50 text-green-600' : 'border-red-500/50 text-red-600'}`}>
                      {item.isActive ? 'Active' : 'Hidden'}
                   </span>
                </div>
                <div className="col-span-4 flex justify-end gap-2">
                  <Link 
                    href={`/admin/merch/${item.id}/edit`}
                    className="p-3 border border-foreground/10 hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button 
                    onClick={async () => {
                      if(confirm("Delete this item?")) await deleteMerchItem(item.id);
                    }}
                    className="p-3 border border-foreground/10 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-serif italic">Incoming Signal Log</h2>
          
          <div className="grid grid-cols-1 border border-foreground/10">
            {orders.length === 0 ? (
               <div className="p-20 text-center font-serif italic text-foreground/30">No orders logged yet.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="group flex flex-col md:grid md:grid-cols-12 gap-6 p-8 border-b border-foreground/10 last:border-b-0 hover:bg-[#eaddcf] transition-colors">
                  <div className="col-span-4 flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/40">Customer</span>
                    <span className="font-serif italic text-2xl group-hover:text-black">{order.customerName}</span>
                    <span className="text-sm font-mono">{order.customerPhone}</span>
                    <span className="text-xs text-foreground/60">{order.customerAddress}</span>
                  </div>

                  <div className="col-span-3 flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/40">Product</span>
                    <span className="font-bold text-sm uppercase">{order.item.title}</span>
                    <span className="text-xs font-mono bg-foreground/5 px-2 py-1 w-fit">
                      {order.size || 'N/A'} / {order.color || 'N/A'}
                    </span>
                  </div>

                  <div className="col-span-3 flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/40">Status</span>
                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING' && <Clock size={14} className="text-orange-500" />}
                      {order.status === 'COMPLETED' && <CheckCircle size={14} className="text-green-500" />}
                      {order.status === 'CANCELLED' && <XCircle size={14} className="text-red-500" />}
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-transparent text-xs font-mono uppercase font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-foreground/40 uppercase mt-auto">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end items-center">
                    <button 
                      onClick={async () => {
                        if(confirm("Delete this order log?")) await deleteMerchOrder(order.id);
                      }}
                      className="p-4 border border-foreground/10 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
