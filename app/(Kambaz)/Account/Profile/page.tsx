/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, FormControl } from "react-bootstrap";
import { setCurrentUser } from "../reducer";
import * as client from "../client";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [profile, setProfile] = useState<any>({});
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/Account/Signin");
      return;
    }
    setProfile(currentUser);
  }, [currentUser, router]);

  const updateProfile = async () => {
    try {
      const updatedProfile = await client.updateUser(profile);
      dispatch(setCurrentUser(updatedProfile));
    } catch (e) {
      console.error("Failed to update profile:", e);
    }
  };

  const signout = async () => {
    try {
      await client.signout();
    } catch (e) {
      console.error("Signout failed:", e);
    }
    dispatch(setCurrentUser(null));
    router.push("/Account/Signin");
  };

  return (
    <div id="wd-profile-screen" className="wd-profile-screen p-3">
      <div className="mx-auto" style={{ maxWidth: 420 }}>
        <h3>Profile</h3>
        {profile && (
          <div>
            <FormControl
              id="wd-username"
              className="mb-2"
              placeholder="Username"
              value={profile.username || ""}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
            />

            <FormControl
              id="wd-password"
              className="mb-2"
              type="password"
              placeholder="Password"
              value={profile.password || ""}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
            />

            <FormControl
              id="wd-firstname"
              className="mb-2"
              placeholder="First name"
              value={profile.firstName || ""}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
            />

            <FormControl
              id="wd-lastname"
              className="mb-2"
              placeholder="Last name"
              value={profile.lastName || ""}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
            />

            <FormControl
              id="wd-dob"
              className="mb-2"
              type="date"
              value={profile.dob || ""}
              onChange={(e) =>
                setProfile({ ...profile, dob: e.target.value })
              }
            />

            <FormControl
              id="wd-email"
              className="mb-2"
              type="email"
              placeholder="Email"
              value={profile.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />

            <select
              className="form-control mb-2"
              id="wd-role"
              value={profile.role || ""}
              onChange={(e) =>
                setProfile({ ...profile, role: e.target.value })
              }
            >
              <option value="">Select role</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="FACULTY">Faculty</option>
              <option value="STUDENT">Student</option>
            </select>

            <Button
              id="wd-update-profile-btn"
              onClick={updateProfile}
              className="w-100 mb-2"
            >
              Update
            </Button>

            <Button
              id="wd-signout-btn"
              onClick={signout}
              className="w-100 mb-2"
              variant="secondary"
            >
              Sign out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
