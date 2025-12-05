/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FormControl, Button } from "react-bootstrap";
import { setCurrentUser } from "../reducer";
import * as client from "../client";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [user, setUser] = useState<any>({ username: "", password: "" });
  const dispatch = useDispatch();
  const router = useRouter();  

  const signup = async () => {
    try {
      const currentUser = await client.signup(user);
      dispatch(setCurrentUser(currentUser));
      router.push("/Account/Profile"); 
    } catch (e) {
      console.error("Signup error:", e);
    }
  };

  return (
    <div id="wd-signup-screen" className="p-3">
      <div className="mx-auto" style={{ maxWidth: 420 }}>
        <h1>Sign up</h1>

        <FormControl
          id="wd-username"
          placeholder="username"
          className="mb-2 w-100"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />

        <FormControl
          id="wd-password"
          placeholder="password"
          type="password"
          className="mb-2 w-100"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        <Button id="wd-signup-btn" className="w-100 mb-2" onClick={signup}>
          Sign Up
        </Button>

        <Link id="wd-signin-link" href="/Account/Signin">
          Sign in
        </Link>
      </div>
    </div>
  );
}
