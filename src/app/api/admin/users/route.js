import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const ADMIN_EMAIL =
  "hafizshaheerahmedkhan@gmail.com";

const ALLOWED_ROLES = [
  "student",
  "teacher",
  "admin",
];

const ALLOWED_STATUSES = [
  "approved",
  "pending",
  "rejected",
];

// ======================================================
// VERIFY ADMIN
// ======================================================

async function verifyAdmin(request) {
  const authHeader =
    request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const idToken =
    authHeader.replace("Bearer ", "").trim();

  if (!idToken) {
    throw new Error("UNAUTHORIZED");
  }

  const decodedToken =
    await adminAuth.verifyIdToken(idToken);

  if (
    !decodedToken.email ||
    decodedToken.email.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
  ) {
    throw new Error("FORBIDDEN");
  }

  return decodedToken;
}

// ======================================================
// GET ALL USERS
// ======================================================

export async function GET(request) {
  try {
    await verifyAdmin(request);

    const snap =
      await adminDb.collection("users").get();

    const users = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        uid: data.uid || doc.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "student",
        status: data.status || "approved",
        board: data.board || "",
        field: data.field || "",
        subField: data.subField || "",
        createdAt: data.createdAt || "",
      };
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error(
      "Admin users GET error:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load users.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// UPDATE USER STATUS / ROLE
// ======================================================

export async function PATCH(request) {
  try {
    const adminUser =
      await verifyAdmin(request);

    const body = await request.json();

    const {
      uid,
      status,
      role,
    } = body;

    if (!uid) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== undefined &&
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          error: "Invalid status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      role !== undefined &&
      !ALLOWED_ROLES.includes(role)
    ) {
      return NextResponse.json(
        {
          error: "Invalid role.",
        },
        {
          status: 400,
        }
      );
    }

    // Prevent admin account from being changed
    if (uid === adminUser.uid) {
      return NextResponse.json(
        {
          error:
            "Your admin account cannot be modified from this panel.",
        },
        {
          status: 403,
        }
      );
    }

    const userRef =
      adminDb.collection("users").doc(uid);

    const userSnap =
      await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (role !== undefined) {
      updateData.role = role;

      // Teachers need approval.
      if (
        role === "teacher" &&
        status === undefined
      ) {
        updateData.status = "pending";
      }
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No changes were provided.",
        },
        {
          status: 400,
        }
      );
    }

    await userRef.update(updateData);

    return NextResponse.json({
      success: true,
      message:
        "User updated successfully.",
    });
  } catch (error) {
    console.error(
      "Admin users PATCH error:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE USER
// ======================================================

export async function DELETE(request) {
  try {
    const adminUser =
      await verifyAdmin(request);

    const body = await request.json();

    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Never allow the admin to delete
    // their own account.
    if (uid === adminUser.uid) {
      return NextResponse.json(
        {
          error:
            "You cannot delete your own admin account.",
        },
        {
          status: 403,
        }
      );
    }

    const userRef =
      adminDb.collection("users").doc(uid);

    const userSnap =
      await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Delete Firebase Authentication account
    await adminAuth.deleteUser(uid);

    // Delete Firestore user document
    await userRef.delete();

    return NextResponse.json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin users DELETE error:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}