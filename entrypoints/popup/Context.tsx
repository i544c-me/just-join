import type { ParentComponent } from "solid-js";
import type { Notice } from "../lib/common";

type Store = {
  notifications: Notice[];
}

export const Context = createContext({
  store: {} as Store,
  addNotification(notification: Notice) {},
  removeNotification(index: number) {},
});

export const Provider: ParentComponent = (props) => {
  const [store, setStore] = createStore<Store>({
    notifications: [],
  });
  const value = {
    store,
    addNotification(notification: Notice) {
      setStore("notifications", notifications => [...notifications, notification]);
      console.log("add notifications", store.notifications);
    },
    removeNotification(index: number) {
      setStore("notifications", notifications => notifications.toSpliced(index, 1));
      console.log("remove notifications", store.notifications);
    },
  };
  return (
    <Context.Provider value={value}>
      {props.children}
    </Context.Provider>
  )
};
