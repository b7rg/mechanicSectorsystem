"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PenaltiesPage() {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    return onSnapshot(
      collection(db, "penalties"),
      (snapshot) => {
        setItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
  }, []);

  async function addPenalty() {
    if (!title || !value) return;

    await addDoc(collection(db, "penalties"), {
      title,
      value,
    });

    setTitle("");
    setValue("");
  }

  async function remove(id: string) {
    await deleteDoc(doc(db, "penalties", id));
  }

  return (
    <main className="space-y-8">

      <h1 className="text-4xl font-black text-yellow-400">
        إدارة المخالفات
      </h1>

      <div className="rounded-3xl bg-[#141414] p-6 space-y-4">

        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          placeholder="اسم المخالفة"
          className="w-full rounded-xl bg-[#1b1b1b] p-4"
        />

        <input
          value={value}
          onChange={(e)=>setValue(e.target.value)}
          placeholder="العقوبة"
          className="w-full rounded-xl bg-[#1b1b1b] p-4"
        />

        <button
          onClick={addPenalty}
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black"
        >
          إضافة مخالفة
        </button>

      </div>

      <div className="space-y-3">

        {items.map((item:any)=>(

          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-[#141414] p-5"
          >

            <div>

              <h2 className="font-bold text-white">
                {item.title}
              </h2>

              <p className="text-red-400">
                {item.value}
              </p>

            </div>

            <button
              onClick={()=>remove(item.id)}
              className="rounded-xl bg-red-600 px-5 py-2"
            >
              حذف
            </button>

          </div>

        ))}

      </div>

    </main>
  );
}