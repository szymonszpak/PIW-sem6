"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

const initialState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };
      
    case "ADD_ITEM":
      if (state.items.find((item) => item.id === action.payload.id)) {
        return state; 
      }
      return { ...state, items: [...state.items, action.payload] };

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const localData = localStorage.getItem(`cart_${currentUser.email}`);
        dispatch({ type: "SET_CART", payload: localData ? JSON.parse(localData) : [] });
      } else {
        dispatch({ type: "SET_CART", payload: [] });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(state.items));
    }
  }, [state.items, user]);

  return (
    <CartContext.Provider value={{ cart: state.items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}