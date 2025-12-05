/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FormControl, Button } from "react-bootstrap";
import { setCurrentUser } from "../reducer";
import * as client from "../client";
import { useRouter } from "next/navigation"; 

export default function Signin() {
  const [credentials, setCredentials] = useState<any>({
    username: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();  

  const signin = async () => {
    try {
      const user = await client.signin(credentials);
      if (!user) return;

      dispatch(setCurrentUser(user));
      router.push("/Dashboard");  
    } catch (e) {
      console.error("Signin failed:", e);
    }
  };

  return (
    <div id="wd-signin-screen" className="p-3">
      <div className="mx-auto" style={{ maxWidth: 420 }}>
        <h1>Sign in</h1>

        <FormControl
          id="wd-username"
          placeholder="username"
          className="mb-2 w-100"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
        />
        <FormControl
          id="wd-password"
          placeholder="password"
          type="password"
          className="mb-2 w-100"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />

        <Button id="wd-signin-btn" className="w-100 mb-2" onClick={signin}>
          Sign in
        </Button>

        <Link id="wd-signup-link" href="/Account/Signup">
          Sign up
        </Link>
      </div>
    </div>
  );
}
