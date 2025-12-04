"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FormControl } from "react-bootstrap";
import { setCurrentUser } from "../reducer";
import * as client from "../client";

export default function Signin() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const signin = async () => {
    const user = await client.signin(credentials);
    if (!user) return;
    dispatch(setCurrentUser(user));
    router.replace("/Account/Profile");
  };

  return (
    <div id="wd-signin-screen" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-3">Sign in</h1>
      <FormControl
        id="wd-username"
        placeholder="username"
        className="mb-2"
        value={credentials.username}
        onChange={(e) =>
          setCredentials((c) => ({ ...c, username: e.target.value }))
        }
      />
      <FormControl
        id="wd-password"
        placeholder="password"
        type="password"
        className="mb-3"
        value={credentials.password}
        onChange={(e) =>
          setCredentials((c) => ({ ...c, password: e.target.value }))
        }
      />
      <button
        id="wd-signin-btn"
        className="btn btn-primary w-100"
        onClick={signin}
      >
        Sign in
      </button>
    </div>
  );
}
