"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product, ProductVariant } from "@/data/catalog";
import { getProductBySlug } from "@/data/catalog";

export type CartItem = {
  productId: string;
  slug: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  price: number;
};

type AddItemInput = {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
};

type ShopContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  toast: string;
  favoriteIds: string[];
  addItem: (input: AddItemInput) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  resolveCartProduct: (item: CartItem) => Product | undefined;
};

const CART_STORAGE_KEY = "shop-neumopractice-cart-v1";
const FAVORITES_STORAGE_KEY = "shop-neumopractice-favorites-v1";

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

        if (storedCart) {
          setCartItems(JSON.parse(storedCart) as CartItem[]);
        }

        if (storedFavorites) {
          setFavoriteIds(JSON.parse(storedFavorites) as string[]);
        }
      } catch {
        setCartItems([]);
        setFavoriteIds([]);
      } finally {
        setHasHydrated(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, hasHydrated]);

  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    }
  }, [favoriteIds, hasHydrated]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addItem = useCallback(({ product, variant, quantity = 1 }: AddItemInput) => {
    const selectedVariant = variant ?? product.variants[0];
    const variantId = selectedVariant?.id ?? `${product.id}-default`;
    const variantName = selectedVariant?.name ?? "Opción única";
    const sku = selectedVariant?.sku ?? product.sku;
    const price = selectedVariant?.price ?? product.price;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.id && item.variantId === variantId,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.id && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          productId: product.id,
          slug: product.slug,
          variantId,
          variantName,
          sku,
          quantity,
          price,
        },
      ];
    });

    setToast("Producto agregado al carrito");
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId || item.variantId !== variantId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    const nextQuantity = Math.max(0, quantity);

    setCartItems((currentItems) =>
      nextQuantity === 0
        ? currentItems.filter((item) => item.productId !== productId || item.variantId !== variantId)
        : currentItems.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId],
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const resolveCartProduct = useCallback((item: CartItem) => getProductBySlug(item.slug), []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      cartItems,
      cartCount,
      subtotal,
      isCartOpen,
      toast,
      favoriteIds,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleFavorite,
      isFavorite,
      resolveCartProduct,
    }),
    [
      addItem,
      cartCount,
      cartItems,
      clearCart,
      closeCart,
      favoriteIds,
      isCartOpen,
      isFavorite,
      openCart,
      removeItem,
      resolveCartProduct,
      subtotal,
      toast,
      toggleFavorite,
      updateQuantity,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
