"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartProvider, useCart } from "./cart-provider";
import { WishlistProvider, useWishlist } from "./wishlist-provider";
import { QuickViewProvider } from "./quick-view-provider";
import { AuthProvider } from "./auth-provider";
import { SellerAuthProvider } from "./seller-auth-provider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { openCart, itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const pathname = usePathname();

  if (pathname.startsWith("/seller")) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header onCartOpen={openCart} cartCount={itemCount} wishlistCount={wishlistItems.length} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SellerAuthProvider>
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>
              <ShellInner>{children}</ShellInner>
            </QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </SellerAuthProvider>
    </AuthProvider>
  );
}
