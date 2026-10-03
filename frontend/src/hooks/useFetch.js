import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

const useFetch = (path, params) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params ?? {});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.get(path, JSON.parse(key)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, key]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
};

export default useFetch;
