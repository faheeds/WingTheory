"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  capacityOptions,
  seedOrders,
  type Capacity,
  type CartItem,
  type Order,
  type OrderStatus,
} from "./data";
import { nextOrderStatus, trackingStage } from "./order-machine";

type State = {
  capacity: Capacity;
  soldIds: string[];
  cart: CartItem[];
  orders: Order[];
  lastOrderId: string | null;
  stage: number;
  rewardPoints: number;
};
type Store = State & {
  ready: boolean;
  addItem: (item: CartItem) => void;
  changeQuantity: (key: string, delta: number) => void;
  setCapacity: (value: Capacity) => void;
  toggleSold: (id: string) => void;
  advanceOrder: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  placeDemoOrder: (
    customer: string,
    total: number,
    rewardUsed: boolean,
  ) => string;
  setStage: (stage: number) => void;
  clearCart: () => void;
  resetDemo: () => void;
  toast: string;
  notify: (message: string) => void;
};
const initial: State = {
  capacity: "NORMAL",
  soldIds: ["gp"],
  cart: [],
  orders: seedOrders,
  lastOrderId: null,
  stage: 3,
  rewardPoints: 680,
};
const Context = createContext<Store | null>(null);
const STORAGE = "wing-theory-demo-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setState({ ...initial, ...JSON.parse(saved) });
    } catch {
      /* Reset malformed demo data. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE, JSON.stringify(state));
  }, [state, ready]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE && event.newValue) {
        try {
          setState({ ...initial, ...JSON.parse(event.newValue) });
        } catch {
          /* Ignore malformed cross-tab data. */
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);
  const notify = useCallback((message: string) => setToast(message), []);
  const addItem = (item: CartItem) => {
    setState((s) => ({ ...s, cart: [...s.cart, item] }));
    notify("Added to your order.");
  };
  const changeQuantity = (key: string, delta: number) =>
    setState((s) => ({
      ...s,
      cart: s.cart
        .map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    }));
  const setCapacity = (capacity: Capacity) => {
    setState((s) => ({ ...s, capacity }));
    notify(
      `Kitchen ${capacity.toLowerCase()}. ${capacityOptions[capacity].eta}.`,
    );
  };
  const toggleSold = (id: string) =>
    setState((s) => ({
      ...s,
      soldIds: s.soldIds.includes(id)
        ? s.soldIds.filter((x) => x !== id)
        : [...s.soldIds, id],
    }));
  const setOrderStatus = (id: string, status: OrderStatus) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      stage: s.lastOrderId === id ? trackingStage(status) : s.stage,
    }));
  const advanceOrder = (id: string) =>
    setState((s) => {
      const orders = s.orders.map((o) =>
        o.id === id ? { ...o, status: nextOrderStatus(o.status) } : o,
      );
      const own = orders.find((o) => o.id === s.lastOrderId);
      const stage = own ? trackingStage(own.status) : s.stage;
      return { ...s, orders, stage };
    });
  const placeDemoOrder = (
    customer: string,
    total: number,
    rewardUsed: boolean,
  ) => {
    const id = String(Date.now()).slice(-6);
    setState((s) => ({
      ...s,
      orders: [
        {
          id,
          customer: customer || "Guest",
          channel: "Direct",
          items: s.cart.reduce((n, i) => n + i.quantity, 0),
          note: s.cart
            .map((i) =>
              [i.sauces?.join(" + "), i.instructions]
                .filter(Boolean)
                .join(" · "),
            )
            .filter(Boolean)
            .join(" · "),
          total,
          age: 0,
          promised: 36,
          status: "NEW",
        },
        ...s.orders,
      ],
      cart: [],
      lastOrderId: id,
      stage: 0,
      rewardPoints: rewardUsed ? s.rewardPoints - 500 : s.rewardPoints,
    }));
    return id;
  };
  const setStage = (stage: number) => setState((s) => ({ ...s, stage }));
  const clearCart = () => setState((s) => ({ ...s, cart: [] }));
  const resetDemo = () => {
    setState(initial);
    notify("Demo data reset.");
  };
  return (
    <Context.Provider
      value={{
        ...state,
        ready,
        addItem,
        changeQuantity,
        setCapacity,
        toggleSold,
        advanceOrder,
        setOrderStatus,
        placeDemoOrder,
        setStage,
        clearCart,
        resetDemo,
        toast,
        notify,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider missing");
  return store;
}
