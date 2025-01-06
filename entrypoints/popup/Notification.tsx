import { Context } from "./Context";

export default function Notification() {
  const { store, removeNotification } = useContext(Context);

  const CloseNotification = (index: number) => {
    console.log("remove: ", store.notifications[index]);
    removeNotification(index);
  }

  return (
    <div class="toast">
      <For each={store.notifications}>
        {(notification, index) => (
          <div
            class={`alert ${notification.level === "info" ? "alert-info" : "alert-warning"}`}
          >
            <span class="grow">{notification.message}</span>
            <button type="button" class="btn btn-ghost btn-xs" onClick={() => CloseNotification(index())}>×</button>
          </div>
        )}
      </For>
    </div>
  )
}
