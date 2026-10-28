
import { useEffect } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
};

// 1. Function responsible for fetching users
async function fetchUsers(): Promise<User[]> {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json() as Promise<User[]>;
}

function App() {
  // 2. React Query manages the request and its state

  const queryClient = useQueryClient();
  const {
     data: users,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
    isStale,
    dataUpdatedAt,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 60 * 1000,       // 1 minute
    gcTime: 5 * 60 * 1000,      // 5 minutes
  });


    // 1. Log freshness status
  useEffect(() => {
    console.log(
      `[${new Date().toLocaleTimeString()}] Data is ${
        isStale ? "STALE" : "FRESH"
      }`
    );

    console.log(
      "Last successful update:",
      dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString()
        : "Not fetched yet"
    );
  }, [isStale, dataUpdatedAt]);

  // 2. Log when the inactive query is removed from cache
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "removed" &&
        JSON.stringify(event.query.queryKey) ===
          JSON.stringify(["users"])
      ) {
        console.log(
          `[${new Date().toLocaleTimeString()}] USERS CACHE REMOVED`
        );
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // 3. Loading state
  if (isPending) {
    return (
      <main className="page-container">
        <div className="status-card">
          <div className="spinner" />
          <h2>Loading users...</h2>
          <p>Please wait while we fetch the directory.</p>
        </div>
      </main>
    );
  }

  // 4. Error state
  if (isError) {
    return (
      <main className="page-container">
        <div className="status-card error-card">
          <h2>Unable to load users</h2>
          <p>{error.message}</p>
          <button className="refresh-button" onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // 5. Success state
  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <span className="eyebrow">TEAM DIRECTORY</span>
          <h1>User Directory</h1>
          <p className="subtitle">
            Meet the people in your directory.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <span className={isFetching ? "refresh-icon spinning" : "refresh-icon"}>
            ↻
          </span>
          {isFetching ? "Refreshing..." : "Refresh Users"}
        </button>
      </header>

      <section className="summary-card">
        <div className="summary-icon">👥</div>
        <div>
          <p className="summary-label">Total users</p>
          <h2>{users.length}</h2>
        </div>
        <span className="summary-badge">Directory loaded</span>
      </section>

      <section className="user-grid" aria-label="User directory">
        {users.map((user) => (
          <article className="user-card" key={user.id}>
            <div className="user-card-top">
              <div className="avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-id">
                ID {String(user.id).padStart(2, "0")}
              </span>
            </div>

            <h2 className="user-name">{user.name}</h2>

            <div className="user-details">
              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">✉</span>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>

              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">☎</span>
                <span>{user.phone}</span>
              </div>

              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">↗</span>
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.website}
                </a>
              </div>
            </div>

            <div className="user-card-footer">
              <span className="status-dot" />
              Active directory record
            </div>
          </article>
        ))}
      </section>

      <footer className="page-footer">
        Powered by React, TypeScript and TanStack Query
      </footer>
    </main>
  );
}

export default App;
