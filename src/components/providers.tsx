"use client";

import { useAppDispatch } from "@/store/hooks";
import { store } from "@/store/index";
import { checkAuth } from "@/store/slices/authSlice";
import { type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";

function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
