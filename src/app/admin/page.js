"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL =
  "hafizshaheerahmedkhan@gmail.com";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoading, setActionLoading] = useState("");

  const router = useRouter();

  const stars = Array.from({ length: 20 });

  // ======================================================
  // AUTH CHECK
  // ======================================================

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      if (
        !u.email ||
        u.email.toLowerCase() !==
          ADMIN_EMAIL.toLowerCase()
      ) {
        router.push("/dashboard");
        return;
      }

      setUser(u);

      try {
        await loadUsers(u);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // ======================================================
  // LOAD USERS
  // ======================================================

  async function loadUsers(currentUser = user) {
    if (!currentUser) return;

    const idToken =
      await currentUser.getIdToken();

    const response = await fetch(
      "/api/admin/users",
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${idToken}`,
        },
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load users."
      );
    }

    setUsers(data.users || []);
  }

  // ======================================================
  // UPDATE USER
  // ======================================================

  async function updateUser(uid, changes) {
    try {
      setError("");
      setActionLoading(uid);

      const idToken =
        await user.getIdToken();

      const response = await fetch(
        "/api/admin/users",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid,
            ...changes,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update user."
        );
      }

      await loadUsers(user);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update user."
      );
    } finally {
      setActionLoading("");
    }
  }

  // ======================================================
  // CHANGE ROLE
  // ======================================================

  async function handleRoleChange(
    uid,
    newRole
  ) {
    const selectedUser =
      users.find(
        (u) => u.uid === uid
      );

    if (!selectedUser) return;

    if (
      newRole === "admin" &&
      !window.confirm(
        "Are you sure you want to make this user an admin?"
      )
    ) {
      return;
    }

    await updateUser(uid, {
      role: newRole,
    });
  }

  // ======================================================
  // APPROVE
  // ======================================================

  async function handleApprove(uid) {
    await updateUser(uid, {
      status: "approved",
    });
  }

  // ======================================================
  // REJECT
  // ======================================================

  async function handleReject(uid) {
    if (
      !window.confirm(
        "Are you sure you want to reject this teacher?"
      )
    ) {
      return;
    }

    await updateUser(uid, {
      status: "rejected",
    });
  }

  // ======================================================
  // DELETE USER
  // ======================================================

  async function handleDelete(
    uid,
    name
  ) {
    const confirmed =
      window.confirm(
        `Delete "${name || "this user"}"?\n\nThis will permanently delete the Firebase account and user data. This action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setError("");
      setActionLoading(uid);

      const idToken =
        await user.getIdToken();

      const response = await fetch(
        "/api/admin/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete user."
        );
      }

      setUsers((current) =>
        current.filter(
          (u) => u.uid !== uid
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete user."
      );
    } finally {
      setActionLoading("");
    }
  }

  // ======================================================
  // FILTER USERS
  // ======================================================

  const filteredUsers =
    users.filter((u) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        (u.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (u.email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        u.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        u.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });

  const pendingTeachers =
    users.filter(
      (u) =>
        u.role === "teacher" &&
        u.status === "pending"
    );

  const approvedTeachers =
    users.filter(
      (u) =>
        u.role === "teacher" &&
        u.status === "approved"
    );

  const students =
    users.filter(
      (u) => u.role === "student"
    );

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main
        className="hero-bg-animated"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-cream)",
        }}
      >
        Loading...
      </main>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <main
      className="hero-bg-animated"
      style={{
        minHeight: "100vh",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ==================================================
          BLOBS
      ================================================== */}

      <div
        className="mesh-blob"
        style={{
          top: "-12%",
          left: "-2%",
          width: "380px",
          height: "380px",
          color: "var(--color-gold)",
          background:
            "rgba(255,182,39,0.18)",
          animationDuration: "8s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          bottom: "-12%",
          right: "-2%",
          width: "370px",
          height: "370px",
          color:
            "var(--color-emerald)",
          background:
            "rgba(45,212,191,0.18)",
          animationDuration: "10s",
          animationDelay: "1s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          top: "3%",
          right: "5%",
          width: "220px",
          height: "220px",
          color: "var(--color-coral)",
          background:
            "rgba(255,107,74,0.15)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          bottom: "5%",
          left: "5%",
          width: "200px",
          height: "200px",
          color: "#8B5CF6",
          background:
            "rgba(139,92,246,0.14)",
          animationDuration: "9s",
          animationDelay: "1.5s",
        }}
      />

      {/* ==================================================
          STARS
      ================================================== */}

      {stars.map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            animationDuration:
              `${2 + (i % 4)}s`,
            animationDelay:
              `${i * 0.2}s`,
          }}
        />
      ))}

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          paddingTop: 48,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Link
          href="/dashboard"
          className="btn btn-outline"
          style={{
            display: "inline-block",
            marginBottom: 24,
            padding: "8px 16px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ← Dashboard
        </Link>

        <div
          style={{
            fontSize: 13,
            letterSpacing: 2,
            color: "var(--color-gold)",
            fontWeight: 600,
            textTransform:
              "uppercase",
            marginBottom: 8,
          }}
        >
          Admin
        </div>

        <h1
          style={{
            fontSize:
              "clamp(26px, 5vw, 34px)",
            fontWeight: 800,
            marginBottom: 12,
            color:
              "var(--color-cream)",
          }}
        >
          User Management
        </h1>

        <p
          style={{
            color:
              "rgba(246,243,234,0.6)",
            marginBottom: 28,
          }}
        >
          Manage students, teachers
          and accounts.
        </p>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              borderRadius: 12,
              color: "#ffd7d1",
              background:
                "rgba(255,107,74,0.12)",
              border:
                "1px solid rgba(255,107,74,0.3)",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <SummaryCard
            label="TOTAL USERS"
            value={users.length}
            color="var(--color-gold)"
          />

          <SummaryCard
            label="PENDING TEACHERS"
            value={pendingTeachers.length}
            color="var(--color-gold)"
          />

          <SummaryCard
            label="APPROVED TEACHERS"
            value={approvedTeachers.length}
            color="var(--color-emerald)"
          />

          <SummaryCard
            label="STUDENTS"
            value={students.length}
            color="#8B5CF6"
          />
        </div>

        {/* ==================================================
            PENDING TEACHERS
        ================================================== */}

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color:
              "var(--color-cream)",
            marginBottom: 16,
          }}
        >
          Pending Teachers
        </h2>

        {pendingTeachers.length ===
          0 && (
          <p
            style={{
              color:
                "rgba(246,243,234,0.6)",
              marginBottom: 28,
            }}
          >
            No pending teacher
            requests.
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 14,
            marginBottom: 40,
          }}
        >
          {pendingTeachers.map(
            (t) => (
              <div
                key={t.id}
                className="subject-card"
                style={{
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color:
                      "var(--color-cream)",
                  }}
                >
                  {t.name ||
                    "Unnamed User"}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color:
                      "rgba(246,243,234,0.5)",
                    marginBottom: 8,
                  }}
                >
                  {t.email}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color:
                      "rgba(246,243,234,0.55)",
                    marginBottom: 16,
                  }}
                >
                  {t.board ||
                    "Board not selected"}
                  {" • "}
                  {t.field ||
                    "Field not selected"}
                  {" • "}
                  {t.subField ||
                    "Class not selected"}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      handleApprove(
                        t.uid
                      )
                    }
                    disabled={
                      actionLoading ===
                      t.uid
                    }
                    className="btn btn-primary"
                    style={{
                      padding:
                        "10px 18px",
                      borderRadius: 10,
                      border:
                        "none",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor:
                        "pointer",
                      opacity:
                        actionLoading ===
                        t.uid
                          ? 0.6
                          : 1,
                    }}
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() =>
                      handleReject(
                        t.uid
                      )
                    }
                    disabled={
                      actionLoading ===
                      t.uid
                    }
                    className="btn btn-outline"
                    style={{
                      padding:
                        "10px 18px",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor:
                        "pointer",
                      opacity:
                        actionLoading ===
                        t.uid
                          ? 0.6
                          : 1,
                    }}
                  >
                    ✕ Reject
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        t.uid,
                        t.name
                      )
                    }
                    disabled={
                      actionLoading ===
                      t.uid
                    }
                    style={{
                      padding:
                        "10px 18px",
                      borderRadius: 10,
                      border:
                        "1px solid rgba(255,107,74,0.35)",
                      background:
                        "rgba(255,107,74,0.08)",
                      color:
                        "#ff9b89",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor:
                        "pointer",
                      opacity:
                        actionLoading ===
                        t.uid
                          ? 0.6
                          : 1,
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* ==================================================
            ALL USERS
        ================================================== */}

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color:
              "var(--color-cream)",
            marginBottom: 16,
          }}
        >
          All Users
        </h2>

        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}

        <div
          className="subject-card"
          style={{
            marginBottom: 20,
            cursor: "default",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1fr) repeat(2, minmax(150px, 200px))",
              gap: 14,
            }}
          >
            {/* SEARCH */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  color:
                    "rgba(246,243,234,0.65)",
                }}
              >
                Search Users
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "rgba(246,243,234,0.45)",
                    fontSize: 14,
                    pointerEvents:
                      "none",
                    zIndex: 2,
                  }}
                >
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Name or email"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="form-input"
                  style={{
                    ...inputStyle,
                    height: 46,
                    paddingLeft: 40,
                    marginBottom: 0,
                  }}
                />
              </div>
            </div>

            {/* ROLE FILTER */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  color:
                    "rgba(246,243,234,0.65)",
                }}
              >
                Role
              </label>

              <AnimatedSelect
                value={roleFilter}
                placeholder="Select Role"
                options={[
                  {
                    value: "all",
                    label: "All Roles",
                    color: "gold",
                  },
                  {
                    value: "student",
                    label: "Students",
                    color: "gold",
                  },
                  {
                    value: "teacher",
                    label: "Teachers",
                    color: "emerald",
                  },
                  {
                    value: "admin",
                    label: "Admins",
                    color: "emerald",
                  },
                ]}
                onChange={setRoleFilter}
              />
            </div>

            {/* STATUS FILTER */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  color:
                    "rgba(246,243,234,0.65)",
                }}
              >
                Status
              </label>

              <AnimatedSelect
                value={statusFilter}
                placeholder="Select Status"
                options={[
                  {
                    value: "all",
                    label: "All Status",
                    color: "gold",
                  },
                  {
                    value: "approved",
                    label: "Approved",
                    color: "emerald",
                  },
                  {
                    value: "pending",
                    label: "Pending",
                    color: "gold",
                  },
                  {
                    value: "rejected",
                    label: "Rejected",
                    color: "coral",
                  },
                ]}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 0,
              fontSize: 12,
              color:
                "rgba(246,243,234,0.5)",
            }}
          >
            Showing{" "}
            <span
              style={{
                color:
                  "var(--color-gold)",
                fontWeight: 700,
              }}
            >
              {filteredUsers.length}
            </span>{" "}
            of {users.length} users
          </div>
        </div>

        {/* ==================================================
            USER LIST
        ================================================== */}

        {filteredUsers.length ===
        0 ? (
          <p
            style={{
              color:
                "rgba(246,243,234,0.6)",
            }}
          >
            No users match your
            search or filters.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 12,
            }}
          >
            {filteredUsers.map(
              (u) => {
                const isAdmin =
                  u.email?.toLowerCase() ===
                  ADMIN_EMAIL.toLowerCase();

                const isBusy =
                  actionLoading ===
                  u.uid;

                return (
                  <div
                    key={u.id}
                    className="subject-card"
                    style={{
                      cursor:
                        "default",
                    }}
                  >
                    {/* USER HEADER */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: 16,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight:
                              700,
                            fontSize: 16,
                            color:
                              "var(--color-cream)",
                          }}
                        >
                          {u.name ||
                            "Unnamed User"}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color:
                              "rgba(246,243,234,0.5)",
                            marginTop: 4,
                          }}
                        >
                          {u.email}
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 8,
                          alignItems:
                            "flex-start",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <span
                          style={{
                            padding:
                              "5px 10px",
                            borderRadius:
                              999,
                            fontSize:
                              11,
                            fontWeight:
                              700,
                            background:
                              "rgba(255,182,39,0.12)",
                            color:
                              "var(--color-gold)",
                          }}
                        >
                          {u.role}
                        </span>

                        <span
                          style={{
                            padding:
                              "5px 10px",
                            borderRadius:
                              999,
                            fontSize:
                              11,
                            fontWeight:
                              700,
                            background:
                              u.status ===
                              "approved"
                                ? "rgba(45,212,191,0.12)"
                                : u.status ===
                                  "pending"
                                ? "rgba(255,182,39,0.12)"
                                : "rgba(255,107,74,0.12)",
                            color:
                              u.status ===
                              "approved"
                                ? "var(--color-emerald)"
                                : u.status ===
                                  "pending"
                                ? "var(--color-gold)"
                                : "var(--color-coral)",
                          }}
                        >
                          {u.status}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div
                      style={{
                        marginTop: 14,
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 8,
                        fontSize: 12,
                        color:
                          "rgba(246,243,234,0.55)",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color:
                              "rgba(246,243,234,0.75)",
                          }}
                        >
                          Board:
                        </strong>{" "}
                        {u.board ||
                          "Not selected"}
                      </div>

                      <div>
                        <strong
                          style={{
                            color:
                              "rgba(246,243,234,0.75)",
                          }}
                        >
                          Field:
                        </strong>{" "}
                        {u.field ||
                          "Not selected"}
                      </div>

                      <div>
                        <strong
                          style={{
                            color:
                              "rgba(246,243,234,0.75)",
                          }}
                        >
                          Class:
                        </strong>{" "}
                        {u.subField ||
                          "Not selected"}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    {!isAdmin && (
                      <div
                        style={{
                          marginTop: 18,
                          paddingTop: 14,
                          borderTop:
                            "1px solid rgba(246,243,234,0.08)",
                          display:
                            "flex",
                          gap: 10,
                          flexWrap:
                            "wrap",
                          alignItems:
                            "center",
                        }}
                      >
                        {/* ROLE CHANGE */}
                        <div
                          style={{
                            width: 170,
                          }}
                        >
                          <AnimatedSelect
                            value={
                              u.role
                            }
                            placeholder="Select Role"
                            options={[
                              {
                                value:
                                  "student",
                                label:
                                  "Student",
                                color:
                                  "gold",
                              },
                              {
                                value:
                                  "teacher",
                                label:
                                  "Teacher",
                                color:
                                  "emerald",
                              },
                              {
                                value:
                                  "admin",
                                label:
                                  "Admin",
                                color:
                                  "emerald",
                              },
                            ]}
                            onChange={(
                              value
                            ) =>
                              handleRoleChange(
                                u.uid,
                                value
                              )
                            }
                            disabled={
                              isBusy
                            }
                          />
                        </div>

                        {/* APPROVE / REJECT */}

                        {u.role ===
                          "teacher" &&
                          u.status ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(
                                    u.uid
                                  )
                                }
                                disabled={
                                  isBusy
                                }
                                className="btn btn-primary"
                                style={{
                                  padding:
                                    "9px 14px",
                                  borderRadius:
                                    9,
                                  border:
                                    "none",
                                  fontWeight:
                                    600,
                                  fontSize:
                                    12,
                                  cursor:
                                    "pointer",
                                  opacity:
                                    isBusy
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                ✓ Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleReject(
                                    u.uid
                                  )
                                }
                                disabled={
                                  isBusy
                                }
                                className="btn btn-outline"
                                style={{
                                  padding:
                                    "9px 14px",
                                  borderRadius:
                                    9,
                                  fontWeight:
                                    600,
                                  fontSize:
                                    12,
                                  cursor:
                                    "pointer",
                                  opacity:
                                    isBusy
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              u.uid,
                              u.name
                            )
                          }
                          disabled={
                            isBusy
                          }
                          style={{
                            padding:
                              "9px 14px",
                            borderRadius:
                              9,
                            border:
                              "1px solid rgba(255,107,74,0.35)",
                            background:
                              "rgba(255,107,74,0.08)",
                            color:
                              "#ff9b89",
                            fontWeight:
                              600,
                            fontSize:
                              12,
                            cursor:
                              "pointer",
                            opacity:
                              isBusy
                                ? 0.6
                                : 1,
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <div
                        style={{
                          marginTop: 16,
                          fontSize: 12,
                          color:
                            "rgba(246,243,234,0.4)",
                        }}
                      >
                        🔐 Main admin account
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          ANIMATED SELECT STYLES
      ================================================== */}

      <style jsx global>{`
        @keyframes selectBlobOne {
          0%,
          100% {
            transform: translate3d(
                0,
                0,
                0
              )
              scale(1);
            opacity: 0.65;
          }

          50% {
            transform: translate3d(
                -25px,
                12px,
                0
              )
              scale(1.25);
            opacity: 1;
          }
        }

        @keyframes selectBlobTwo {
          0%,
          100% {
            transform: translate3d(
                0,
                0,
                0
              )
              scale(1);
            opacity: 0.55;
          }

          50% {
            transform: translate3d(
                25px,
                -15px,
                0
              )
              scale(1.2);
            opacity: 0.9;
          }
        }

        @keyframes selectMenuIn {
          from {
            opacity: 0;
            transform: translateY(
                -6px
              )
              scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(
                0
              )
              scale(1);
          }
        }

        .animated-option-gold:hover {
          border-color: var(
            --color-gold
          ) !important;
          background: rgba(
            255,
            182,
            39,
            0.13
          ) !important;
          color: var(
            --color-gold
          ) !important;
          box-shadow:
            0 0 14px
              rgba(
                255,
                182,
                39,
                0.22
              );
          transform: translateX(
            2px
          );
        }

        .animated-option-emerald:hover {
          border-color: var(
            --color-emerald
          ) !important;
          background: rgba(
            45,
            212,
            191,
            0.11
          ) !important;
          color: var(
            --color-emerald
          ) !important;
          box-shadow:
            0 0 14px
              rgba(
                45,
                212,
                191,
                0.22
              );
          transform: translateX(
            2px
          );
        }

        .animated-option-coral:hover {
          border-color: var(
            --color-coral
          ) !important;
          background: rgba(
            255,
            107,
            74,
            0.11
          ) !important;
          color: var(
            --color-coral
          ) !important;
          box-shadow:
            0 0 14px
              rgba(
                255,
                107,
                74,
                0.22
              );
          transform: translateX(
            2px
          );
        }

        .animated-select-button:hover {
          border-color: var(
            --color-gold
          ) !important;
          box-shadow:
            0 0 14px
              rgba(
                255,
                182,
                39,
                0.25
              );
        }

        .form-input:focus {
          border-color: var(
            --color-gold
          ) !important;
          box-shadow:
            0 0 14px
              rgba(
                255,
                182,
                39,
                0.18
              );
          outline: none;
        }

        @media (max-width: 700px) {
          .admin-filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  color,
}) {
  return (
    <div className="subject-card">
      <div
        style={{
          color,
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "var(--color-cream)",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   ANIMATED SELECT
========================================================= */

function AnimatedSelect({
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] =
    useState(false);

  const wrapperRef =
    useRef(null);

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    );

  useEffect(() => {
    function handleOutsideClick(
      event
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        marginBottom: 16,
      }}
    >
      {/* SELECT BUTTON */}

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          !disabled &&
          setOpen(!open)
        }
        className="animated-select-button"
        style={{
          width: "100%",
          minHeight: 46,
          padding:
            "12px 42px 12px 14px",
          borderRadius: 10,
          border: open
            ? "1px solid var(--color-gold)"
            : "1px solid rgba(255,182,39,0.3)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
          color: selectedOption
            ? "var(--color-cream)"
            : "rgba(246,243,234,0.7)",
          fontSize: 14,
          textAlign: "left",
          cursor: disabled
            ? "not-allowed"
            : "pointer",
          position: "relative",
          overflow: "hidden",
          outline: "none",
          boxSizing: "border-box",
          transition:
            "border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
          boxShadow: open
            ? "0 0 16px rgba(255,182,39,0.35)"
            : "none",
          opacity: disabled
            ? 0.6
            : 1,
        }}
      >
        {/* SMALL BLOBS */}

        <span
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              "rgba(45,212,191,0.10)",
            filter: "blur(20px)",
            top: -35,
            right: 30,
            pointerEvents:
              "none",
            animation:
              "selectBlobOne 5s ease-in-out infinite",
          }}
        />

        <span
          style={{
            position: "absolute",
            width: 70,
            height: 70,
            borderRadius: "50%",
            background:
              "rgba(255,182,39,0.09)",
            filter: "blur(20px)",
            bottom: -35,
            left: 25,
            pointerEvents:
              "none",
            animation:
              "selectBlobTwo 6s ease-in-out infinite",
          }}
        />

        <span
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        {/* ARROW */}

        <span
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform:
              `translateY(-50%) ${
                open
                  ? "rotate(180deg)"
                  : "rotate(0deg)"
              }`,
            transition:
              "transform 0.25s ease",
            color:
              "var(--color-cream)",
            fontSize: 14,
            zIndex: 2,
          }}
        >
          ▼
        </span>
      </button>

      {/* DROPDOWN */}

      {open && !disabled && (
        <div
          className="animated-select-menu"
          style={{
            position: "absolute",
            top:
              "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            borderRadius: 10,
            border:
              "1px solid rgba(255,182,39,0.35)",
            background:
              "linear-gradient(135deg, #292451, #211e46, #182d2b)",
            boxShadow:
              "0 14px 35px rgba(0,0,0,0.45), 0 0 20px rgba(255,182,39,0.12)",
            overflow: "hidden",
            backdropFilter:
              "blur(16px)",
            animation:
              "selectMenuIn 0.22s ease forwards",
          }}
        >
          {/* DROPDOWN BLOBS */}

          <span
            style={{
              position: "absolute",
              width: 130,
              height: 130,
              borderRadius: "50%",
              background:
                "rgba(45,212,191,0.13)",
              filter: "blur(30px)",
              top: -70,
              right: -30,
              pointerEvents:
                "none",
              animation:
                "selectBlobOne 5s ease-in-out infinite",
            }}
          />

          <span
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background:
                "rgba(255,182,39,0.10)",
              filter: "blur(28px)",
              bottom: -55,
              left: -25,
              pointerEvents:
                "none",
              animation:
                "selectBlobTwo 6s ease-in-out infinite",
            }}
          />

          {/* OPTIONS */}

          <div
            style={{
              position:
                "relative",
              zIndex: 2,
              padding: 5,
            }}
          >
            {options.map(
              (option) => {
                const selected =
                  option.value ===
                  value;

                const color =
                  option.color ||
                  "gold";

                const isEmerald =
                  color ===
                  "emerald";

                const isCoral =
                  color ===
                  "coral";

                let optionClass =
                  "animated-option-gold";

                if (isEmerald) {
                  optionClass =
                    "animated-option-emerald";
                }

                if (isCoral) {
                  optionClass =
                    "animated-option-coral";
                }

                let activeColor =
                  "var(--color-gold)";

                let activeBackground =
                  "rgba(255,182,39,0.12)";

                if (isEmerald) {
                  activeColor =
                    "var(--color-emerald)";
                  activeBackground =
                    "rgba(45,212,191,0.12)";
                }

                if (isCoral) {
                  activeColor =
                    "var(--color-coral)";
                  activeBackground =
                    "rgba(255,107,74,0.12)";
                }

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() => {
                      onChange(
                        option.value
                      );
                      setOpen(false);
                    }}
                    className={
                      optionClass
                    }
                    style={{
                      width: "100%",
                      border: selected
                        ? `1px solid ${activeColor}`
                        : "1px solid transparent",
                      borderRadius: 7,
                      padding:
                        "10px 12px",
                      background:
                        selected
                          ? activeBackground
                          : "transparent",
                      color: selected
                        ? activeColor
                        : "rgba(246,243,234,0.8)",
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                      fontSize: 14,
                      fontFamily:
                        "inherit",
                      marginBottom: 2,
                      transition:
                        "all 0.25s ease",
                    }}
                  >
                    {option.label}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border:
    "1px solid rgba(255,182,39,0.3)",
  background:
    "rgba(255,255,255,0.05)",
  color:
    "var(--color-cream)",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  transition:
    "border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
};