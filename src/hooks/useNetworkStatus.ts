import * as Network from "expo-network";
import { useEffect, useState } from "react";

export type NetworkStatus = "checking" | "online" | "offline";

type NetworkState = Awaited<ReturnType<typeof Network.getNetworkStateAsync>>;

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>("checking");

  useEffect(() => {
    let active = true;

    const updateStatus = (state: NetworkState) => {
      if (!active) return;

      if (
        state.isConnected === false ||
        state.isInternetReachable === false ||
        state.type === Network.NetworkStateType.NONE
      ) {
        setStatus("offline");
      } else if (state.isConnected === true) {
        setStatus("online");
      } else {
        setStatus("checking");
      }
    };

    const subscription = Network.addNetworkStateListener(updateStatus);

    Network.getNetworkStateAsync()
      .then(updateStatus)
      .catch(() => {
        if (active) setStatus("checking");
      });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return status;
}
